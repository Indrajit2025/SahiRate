import base64
import hashlib
import hmac
import json
import math
import os
import random
import secrets
from datetime import datetime, timedelta, timezone
from enum import Enum

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./sahirate.db')
TOKEN_SECRET = os.getenv('TOKEN_SECRET', 'replace-this-demo-secret-before-deployment').encode()
TOKEN_TTL_HOURS = 24

class Base(DeclarativeBase):
    pass

engine = create_engine(
    DATABASE_URL,
    connect_args={'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Role(str, Enum):
    COLLECTOR = 'collector'
    RECYCLER = 'recycler'
    AUTHORITY = 'authority'

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(300))
    role: Mapped[str] = mapped_column(String(30))
    city: Mapped[str] = mapped_column(String(100), default='Bhubaneswar')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Price(Base):
    __tablename__ = 'prices'
    id: Mapped[int] = mapped_column(primary_key=True)
    material: Mapped[str] = mapped_column(String(40), index=True)
    low_rate: Mapped[float] = mapped_column(Float)
    high_rate: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), default='kg')
    city: Mapped[str] = mapped_column(String(100), default='Bhubaneswar')
    source: Mapped[str] = mapped_column(String(60), default='MANDI_BENCHMARK')
    observations: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Lot(Base):
    __tablename__ = 'lots'
    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    collector_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    composition_json: Mapped[str] = mapped_column(Text)
    weights_json: Mapped[str] = mapped_column(Text)
    estimated_low: Mapped[float] = mapped_column(Float)
    estimated_high: Mapped[float] = mapped_column(Float)
    total_weight: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default='OPEN')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    collector = relationship(User)

class Offer(Base):
    __tablename__ = 'offers'
    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey('lots.id'))
    recycler_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    rate: Mapped[float] = mapped_column(Float)
    amount: Mapped[float] = mapped_column(Float)
    pickup: Mapped[str] = mapped_column(String(10), default='no')
    status: Mapped[str] = mapped_column(String(30), default='OPEN')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    lot = relationship(Lot)
    recycler = relationship(User)

class Handover(Base):
    __tablename__ = 'handovers'
    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey('lots.id'))
    recycler_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    verified_weight: Mapped[float] = mapped_column(Float)
    final_rate: Mapped[float] = mapped_column(Float)
    payment_mode: Mapped[str] = mapped_column(String(20))
    payment_status: Mapped[str] = mapped_column(String(30), default='PENDING')
    qr_token: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    lot = relationship(Lot)

class AuditEvent(Base):
    __tablename__ = 'audit_events'
    id: Mapped[int] = mapped_column(primary_key=True)
    event_type: Mapped[str] = mapped_column(String(60))
    entity: Mapped[str] = mapped_column(String(60))
    entity_id: Mapped[str] = mapped_column(String(60))
    payload: Mapped[str] = mapped_column(Text)
    previous_hash: Mapped[str] = mapped_column(String(128), default='')
    event_hash: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))



def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 210000)
    return f'{salt}${digest.hex()}'

def verify_password(password: str, stored: str):
    salt, digest = stored.split('$', 1)
    candidate = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 210000).hex()
    return hmac.compare_digest(candidate, digest)

def token_for(user: User):
    payload = {
        'sub': user.id,
        'role': user.role,
        'exp': int((datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)).timestamp())
    }
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':')).encode()).decode().rstrip('=')
    sig = hmac.new(TOKEN_SECRET, body.encode(), hashlib.sha256).hexdigest()
    return f'{body}.{sig}'

def decode_token(token: str):
    try:
        body, sig = token.split('.', 1)
        expected = hmac.new(TOKEN_SECRET, body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            raise ValueError()
        payload = json.loads(base64.urlsafe_b64decode(body + '=' * (-len(body) % 4)))
        if payload['exp'] < datetime.now(timezone.utc).timestamp():
            raise ValueError()
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid or expired session')

bearer = HTTPBearer(auto_error=False)

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(db_session)):
    if not credentials:
        raise HTTPException(status_code=401, detail='Please log in to continue')
    payload = decode_token(credentials.credentials)
    user = db.get(User, payload['sub'])
    if not user:
        raise HTTPException(status_code=401, detail='Account not found')
    return user

def require(*roles):
    def check(user: User = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail='This action is not available to your role')
        return user
    return check

def audit(db: Session, event_type: str, entity: str, entity_id: str, payload: dict):
    previous = db.scalar(select(AuditEvent).order_by(AuditEvent.id.desc()).limit(1))
    previous_hash = previous.event_hash if previous else 'GENESIS'
    body = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    event_hash = hashlib.sha256(f'{previous_hash}|{event_type}|{entity}|{entity_id}|{body}'.encode()).hexdigest()
    db.add(AuditEvent(event_type=event_type, entity=entity, entity_id=str(entity_id), payload=body, previous_hash=previous_hash, event_hash=event_hash))

def public_user(user: User):
    return {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role, 'city': user.city}

def price_data(price: Price):
    return {
        'id': price.id,
        'material': price.material,
        'lowRate': price.low_rate,
        'highRate': price.high_rate,
        'unit': price.unit,
        'city': price.city,
        'source': price.source,
        'observations': price.observations,
        'updatedAt': price.updated_at.isoformat()
    }

def lot_data(lot: Lot):
    return {
        'id': lot.id,
        'publicId': lot.public_id,
        'composition': json.loads(lot.composition_json),
        'weights': json.loads(lot.weights_json),
        'totalWeight': lot.total_weight,
        'estimatedLow': lot.estimated_low,
        'estimatedHigh': lot.estimated_high,
        'status': lot.status,
        'createdAt': lot.created_at.isoformat()
    }

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=6)
    role: Role
    city: str = 'Bhubaneswar'

class LoginIn(BaseModel):
    email: str
    password: str

class PriceIn(BaseModel):
    material: str
    lowRate: float = Field(ge=0)
    highRate: float = Field(ge=0)
    city: str = 'Bhubaneswar'
    observations: int = Field(ge=0, default=0)
    source: str = 'AUTHORITY_ENTERED'

class LotIn(BaseModel):
    composition: dict[str, float]
    weights: dict[str, float]
    totalWeight: float = Field(ge=0)

class OfferIn(BaseModel):
    lotId: int
    rate: float = Field(gt=0)
    pickup: bool = False

class HandoverIn(BaseModel):
    lotId: int
    verifiedWeight: float = Field(gt=0)
    finalRate: float = Field(gt=0)
    paymentMode: str = 'CASH'

app = FastAPI(title='SahiRate API', version='0.1.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173', 
        'http://127.0.0.1:5173',
        'https://sahirate.indrajit.in.net',     
        'https://www.sahirate.indrajit.in.net'
        "https://sahirate.pages.dev"  
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.on_event('startup')
def startup():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if not db.scalar(select(User.id).limit(1)):
            for name, email, role in [
                ('Arjun Collector', 'collector@sahirate.demo', Role.COLLECTOR.value),
                ('EcoCycle Odisha', 'recycler@sahirate.demo', Role.RECYCLER.value),
                ('SahiRate Authority', 'authority@sahirate.demo', Role.AUTHORITY.value)
            ]:
                db.add(User(name=name, email=email, password_hash=hash_password('demo123'), role=role))
            
            # Grounded Indian Mandi & E-Waste benchmarks for the 7 YOLO11 classes
            seed = [
                ('WIRE', 680, 740),       # Copper Wire Scrap
                ('METAL', 220, 280),      # Aluminium / Steel Scrap
                ('PCB', 140, 190),        # Circuit Boards
                ('BATTERY', 95, 135),     # Lead-Acid / Li-Ion blend
                ('MOTOR', 110, 160),      # Copper windings & core
                ('PLASTIC', 22, 34),      # Sorted rigid polymer
                ('DISPLAY', 410, 625)     # Screen / CRT panels
            ]
            for material, low, high in seed:
                db.add(Price(material=material, low_rate=low, high_rate=high, observations=24 if material == 'PCB' else 18))
            db.commit()
    finally:
        db.close()

@app.get('/api/v1/health')
def health():
    return {'status': 'ok', 'service': 'sahirate-api'}

# 6-Month Historical Trends Pipeline
@app.get('/api/v1/trends/{material}')
def get_price_trends(material: str, db: Session = Depends(db_session)):
    mat_upper = material.upper()
    current_price_record = db.scalar(select(Price).where(Price.material == mat_upper).limit(1))
    base_rate = current_price_record.low_rate if current_price_record else 100.0

    # Live Yahoo Finance commodity futures mapping
    yfinance_symbols = {
        'WIRE': 'HG=F',   # Copper Futures
        'METAL': 'ALI=F'  # Aluminum Futures
    }

    trend_series = []
    symbol = yfinance_symbols.get(mat_upper)

    if symbol:
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='6mo', interval='1d')
            if not hist.empty:
                usd_to_inr = 83.5
                for timestamp, row in hist.iterrows():
                    close_price = float(row['Close'])
                    # Convert USD/lb to INR/kg with 85% scrap recovery factor
                    estimated_inr_kg = (close_price * usd_to_inr / 0.453592) * 0.85
                    trend_series.append({
                        'date': timestamp.strftime('%d %b'),
                        'price': round(estimated_inr_kg, 1)
                    })
        except Exception:
            trend_series = []

    # Deterministic fallback anchored to Indian scrap spot rates if offline or unlisted
    if not trend_series:
        today = datetime.now(timezone.utc)
        random.seed(mat_upper)
        current = base_rate
        for day_offset in reversed(range(180)):
            point_date = today - timedelta(days=day_offset)
            current += random.uniform(-2.5, 2.7) + 0.3 * math.sin(day_offset / 12.0)
            current = max(base_rate * 0.7, min(base_rate * 1.35, current))
            if day_offset % 3 == 0:  # Sample every 3 days for clean rendering
                trend_series.append({
                    'date': point_date.strftime('%d %b'),
                    'price': round(current, 1)
                })

    return {'material': mat_upper, 'history': trend_series}

# Add this near your other Pydantic classes
class GoogleLoginIn(BaseModel):
    token: str
    role: Role

# Add this endpoint
GOOGLE_CLIENT_ID = "60347423348-7aisht4u4no81ji4ph9kl8qoqcg9br6k.apps.googleusercontent.com" # Replace with your actual Client ID

@app.post('/api/v1/auth/google')
def google_auth(data: GoogleLoginIn, db: Session = Depends(db_session)):
    # Block Authority from using Google Login
    if data.role == Role.AUTHORITY:
        raise HTTPException(status_code=403, detail='Authority accounts must use strict password authentication.')

    try:
        # Verify the token issued by Google
        idinfo = id_token.verify_oauth2_token(
            data.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        email = idinfo['email'].lower()
        name = idinfo.get('name', 'Google User')
        
        # Check if user exists
        user = db.scalar(select(User).where(User.email == email))
        
        # If user doesn't exist, auto-register them
        if not user:
            user = User(
                name=name,
                email=email,
                password_hash=hash_password(secrets.token_hex(16)), # Dummy password for OAuth users
                role=data.role.value,
                city='Bhubaneswar'
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            audit(db, 'USER_REGISTERED_OAUTH', 'user', str(user.id), public_user(user))
            db.commit()
            
        return {'token': token_for(user), 'user': public_user(user)}

    except ValueError:
        raise HTTPException(status_code=401, detail='Invalid Google token. Please try again.')

@app.post('/api/v1/auth/register')
def register(data: RegisterIn, db: Session = Depends(db_session)):
    if db.scalar(select(User).where(User.email == data.email.lower())):
        raise HTTPException(409, 'Email is already registered')
    user = User(name=data.name, email=data.email.lower(), password_hash=hash_password(data.password), role=data.role.value, city=data.city)
    db.add(user)
    db.commit()
    db.refresh(user)
    audit(db, 'USER_REGISTERED', 'user', str(user.id), public_user(user))
    db.commit()
    return {'token': token_for(user), 'user': public_user(user)}

@app.post('/api/v1/auth/login')
def login(data: LoginIn, db: Session = Depends(db_session)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Incorrect email or password')
    return {'token': token_for(user), 'user': public_user(user)}

@app.get('/api/v1/auth/me')
def me(user: User = Depends(current_user)):
    return public_user(user)

@app.get('/api/v1/prices')
def get_prices(city: str = 'Bhubaneswar', db: Session = Depends(db_session)):
    return [price_data(p) for p in db.scalars(select(Price).where(Price.city == city).order_by(Price.material)).all()]

@app.post('/api/v1/prices')
def add_price(data: PriceIn, user: User = Depends(require(Role.AUTHORITY.value)), db: Session = Depends(db_session)):
    if data.highRate < data.lowRate:
        raise HTTPException(422, 'High rate must be at least low rate')
    price = Price(material=data.material.upper(), low_rate=data.lowRate, high_rate=data.highRate, city=data.city, observations=data.observations, source=data.source)
    db.add(price)
    db.flush()
    audit(db, 'PRICE_CREATED', 'price', str(price.id), price_data(price))
    db.commit()
    db.refresh(price)
    return price_data(price)

@app.get('/api/v1/recyclers')
def recyclers(db: Session = Depends(db_session)):
    users = db.scalars(select(User).where(User.role == Role.RECYCLER.value)).all()
    return [{'id': u.id, 'name': u.name, 'city': u.city, 'verified': True, 'acceptedMaterials': ['BATTERY', 'DISPLAY', 'MOTOR', 'PCB', 'WIRE', 'METAL', 'PLASTIC']} for u in users]

@app.post('/api/v1/lots')
def create_lot(data: LotIn, user: User = Depends(require(Role.COLLECTOR.value)), db: Session = Depends(db_session)):
    prices = {p.material: p for p in db.scalars(select(Price)).all()}
    low = high = 0.0
    for material, weight in data.weights.items():
        price = prices.get(material.upper())
        if price:
            low += weight * price.low_rate
            high += weight * price.high_rate
    lot = Lot(
        public_id=f'LOT-{secrets.token_hex(4).upper()}',
        collector_id=user.id,
        composition_json=json.dumps(data.composition),
        weights_json=json.dumps(data.weights),
        estimated_low=round(low, 2),
        estimated_high=round(high, 2),
        total_weight=data.totalWeight
    )
    db.add(lot)
    db.flush()
    audit(db, 'LOT_CREATED', 'lot', lot.public_id, {'collectorId': user.id, 'weights': data.weights, 'estimatedLow': low, 'estimatedHigh': high})
    db.commit()
    return lot_data(lot)

@app.get('/api/v1/lots')
def lots(user: User = Depends(current_user), db: Session = Depends(db_session)):
    query = select(Lot).order_by(Lot.id.desc())
    query = query.where(Lot.collector_id == user.id) if user.role == Role.COLLECTOR.value else query
    return [lot_data(lot) for lot in db.scalars(query).all()]

@app.post('/api/v1/offers')
def create_offer(data: OfferIn, user: User = Depends(require(Role.RECYCLER.value)), db: Session = Depends(db_session)):
    lot = db.get(Lot, data.lotId)
    if not lot:
        raise HTTPException(404, 'Lot not found')
    offer = Offer(lot_id=lot.id, recycler_id=user.id, rate=data.rate, amount=round(data.rate * lot.total_weight, 2), pickup='yes' if data.pickup else 'no')
    db.add(offer)
    db.flush()
    audit(db, 'OFFER_CREATED', 'offer', str(offer.id), {'lotId': lot.id, 'recyclerId': user.id, 'amount': offer.amount})
    db.commit()
    return {'id': offer.id, 'amount': offer.amount, 'rate': offer.rate, 'pickup': offer.pickup}

@app.post('/api/v1/handovers')
def create_handover(data: HandoverIn, user: User = Depends(require(Role.RECYCLER.value)), db: Session = Depends(db_session)):
    lot = db.get(Lot, data.lotId)
    if not lot:
        raise HTTPException(404, 'Lot not found')
    qr_payload = {
        'lotId': lot.id,
        'recyclerId': user.id,
        'verifiedWeight': data.verifiedWeight,
        'finalRate': data.finalRate,
        'exp': int((datetime.now(timezone.utc) + timedelta(minutes=15)).timestamp()),
        'nonce': secrets.token_hex(12)
    }
    body = base64.urlsafe_b64encode(json.dumps(qr_payload, separators=(',', ':')).encode()).decode().rstrip('=')
    qr = f'{body}.{hmac.new(TOKEN_SECRET, body.encode(), hashlib.sha256).hexdigest()}'
    handover = Handover(lot_id=lot.id, recycler_id=user.id, verified_weight=data.verifiedWeight, final_rate=data.finalRate, payment_mode=data.paymentMode, qr_token=qr)
    db.add(handover)
    lot.status = 'HANDOVER_PROPOSED'
    db.flush()
    audit(db, 'HANDOVER_PROPOSED', 'handover', str(handover.id), qr_payload)
    db.commit()
    return {'handoverId': handover.id, 'qrToken': qr, 'expiresInMinutes': 15}

@app.post('/api/v1/handovers/{handover_id}/confirm-payment')
def confirm_payment(handover_id: int, user: User = Depends(require(Role.COLLECTOR.value)), db: Session = Depends(db_session)):
    handover = db.get(Handover, handover_id)
    if not handover:
        raise HTTPException(404, 'Handover not found')
    if handover.lot.collector_id != user.id:
        raise HTTPException(403, 'This handover does not belong to you')
    handover.payment_status = 'PAID'
    handover.lot.status = 'COMPLETED'
    audit(db, 'PAYMENT_CONFIRMED', 'handover', str(handover.id), {'amount': round(handover.verified_weight * handover.final_rate, 2), 'mode': handover.payment_mode})
    db.commit()
    return {'status': 'PAID', 'amount': round(handover.verified_weight * handover.final_rate, 2)}

@app.get('/api/v1/dashboard/collector')
def collector_dashboard(user: User = Depends(require(Role.COLLECTOR.value)), db: Session = Depends(db_session)):
    completed = db.scalars(select(Handover).join(Lot).where(Lot.collector_id == user.id, Handover.payment_status == 'PAID')).all()
    total = sum(h.verified_weight * h.final_rate for h in completed)
    return {'totalEarnings': round(total, 2), 'completedHandovers': len(completed), 'lots': len(db.scalars(select(Lot).where(Lot.collector_id == user.id)).all())}

@app.get('/api/v1/dashboard/authority')
def authority_dashboard(user: User = Depends(require(Role.AUTHORITY.value)), db: Session = Depends(db_session)):
    return {
        'users': db.scalar(select(func.count(User.id))) or 0,
        'lots': db.scalar(select(func.count(Lot.id))) or 0,
        'auditEvents': db.scalar(select(func.count(AuditEvent.id))) or 0,
        'recentAudit': [{'type': e.event_type, 'entity': e.entity, 'hash': e.event_hash[:12], 'at': e.created_at.isoformat()} for e in db.scalars(select(AuditEvent).order_by(AuditEvent.id.desc()).limit(12)).all()]
    }
