import { useEffect, useRef, useState, useMemo } from 'react'
import { predict } from './ml/predict'
import { DEFAULT_SETTINGS } from './ml/settings'
import { api } from './api'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import './App.css'
import './auth.css'

const NAMES = ['BATTERY', 'DISPLAY', 'MOTOR', 'PCB', 'WIRE', 'METAL', 'PLASTIC']
const COLORS = ['#ff7060', '#f6b93b', '#65c79f', '#639cf1', '#a77ae8', '#8c99a6', '#f47eae']
const RECYCLERS = [
  { name: 'EcoCycle Odisha', distance: '3.2 km', rate: '₹132/kg', tag: 'Best overall', pickup: true },
  { name: 'GreenLoop Recyclers', distance: '7.1 km', rate: '₹138/kg', tag: 'Best price', pickup: false },
  { name: 'RenewHub Materials', distance: '9.4 km', rate: '₹126/kg', tag: 'Pickup available', pickup: true }
]

const DICT = {
  en: {
    home: 'Home', scan: 'New lot', prices: 'Price board', recyclers: 'Recyclers',
    handover: 'Handover', earnings: 'Earnings', safety: 'Guide & Safety', login: 'Log in',
    logout: 'Log out', offline: 'Offline ready',
    heroTitle: 'Know the Actual Rate of Your Scrap.',
    heroSub: 'Understand material. Check fair local prices. Connect with verified recyclers.',
    startLot: '+ Start a new lot', yourEarnings: 'Your earnings', viewLedger: 'View ledger →',
    todaysPrices: "Today's prices", seeAll: 'See all →', understandMat: 'Understand your material',
    scanSub: 'Use the camera to estimate visible material regions in your lot.',
    takePhoto: '◉ TAKE / UPLOAD PHOTO', visibleComp: 'Visible composition',
    confirmCont: 'Confirm & continue →', knowRange: 'Know the fair local range',
    estLotVal: 'ESTIMATED LOT VALUE', totalMode: 'Total Weight Mode', indMode: 'By Material Mode',
    approxTotal: 'Approx. total weight (kg)', sellLot: 'Sell this lot →',
    welcomeCollector: 'Welcome to SahiRate',
    welcomeSub: 'Scan scrap, evaluate fair rates in Bhubaneswar, and connect with authorized recyclers.'
  },
  hi: {
    home: 'होम', scan: 'नया लॉट', prices: 'भाव सूची', recyclers: 'रीसाइक्लर',
    handover: 'हैंडओवर', earnings: 'कमाई', safety: 'मार्गदर्शिका व सुरक्षा', login: 'लॉग इन',
    logout: 'लॉग आउट', offline: 'ऑफलाइन तैयार',
    heroTitle: 'अपने कबाड़ का असली और सही भाव जानें।',
    heroSub: 'सामग्री पहचानें। स्थानीय उचित मूल्य जानें। प्रमाणित रीसाइक्लर्स से जुड़ें।',
    startLot: '+ नया लॉट शुरू करें', yourEarnings: 'आपकी कमाई', viewLedger: 'खाता देखें →',
    todaysPrices: 'आज का भाव', seeAll: 'सभी देखें →', understandMat: 'अपनी सामग्री समझें',
    scanSub: 'अपने कबाड़ में सामग्री की पहचान के लिए कैमरे का उपयोग करें।',
    takePhoto: '◉ फोटो लें / अपलोड करें', visibleComp: 'दृश्य संरचना (AI)',
    confirmCont: 'पुष्टि करें और आगे बढ़ें →', knowRange: 'उचित स्थानीय मूल्य सीमा',
    estLotVal: 'अनुमानित लॉट मूल्य', totalMode: 'कुल वजन मोड', indMode: 'अलग-अलग वजन मोड',
    approxTotal: 'अनुमानित कुल वजन (kg)', sellLot: 'यह लॉट बेचें →',
    welcomeCollector: 'सही-रेट में आपका स्वागत है',
    welcomeSub: 'कबाड़ स्कैन करें, उचित स्थानीय मूल्य जानें, और सीधे रीसाइक्लर को बेचें।'
  },
  mr: {
    home: 'मुख्यपृष्ठ', scan: 'नवीन लॉट', prices: 'दर पत्रक', recyclers: 'पुनर्वापरकर्ते',
    handover: 'हस्तांतरण', earnings: 'कमाई', safety: 'मार्गदर्शक आणि सुरक्षा', login: 'लॉग इन',
    logout: 'लॉग आउट', offline: 'ऑफलाइन सज्ज',
    heroTitle: 'तुमच्या भंगाराचे खरे आणि योग्य मूल्य जाणून घ्या.',
    heroSub: 'साहित्य ओळखा. स्थानिक योग्य दर तपासा. अधिकृत खरेदीदारांशी जोडा.',
    startLot: '+ नवीन लॉट सुरू करा', yourEarnings: 'तुमची कमाई', viewLedger: 'खाते पहा →',
    todaysPrices: 'आजचे दर', seeAll: 'सर्व पहा →', understandMat: 'तुमचे साहित्य समजून घ्या',
    scanSub: 'साहित्याचे वर्गीकरण करण्यासाठी कॅमेऱ्याने फोटो घ्या.',
    takePhoto: '◉ फोटो घ्या / अपलोड करा', visibleComp: 'साहित्याचे प्रमाण (AI)',
    confirmCont: 'निश्चित करा आणि पुढे चला →', knowRange: 'स्थानिक बाजार भाव',
    estLotVal: 'अंदाजे एकूण मूल्य', totalMode: 'एकूण वजन मोड', indMode: 'प्रत्येक वस्तूचे वजन',
    approxTotal: 'अंदाजे एकूण वजन (kg)', sellLot: 'हा लॉट विका →',
    welcomeCollector: 'सही-रेट मध्ये आपले स्वागत आहे',
    welcomeSub: 'भंगार स्कॅन करा, योग्य दर मिळवा आणि अधिकृत पुनर्वापर केंद्राशी व्यवहार करा.'
  },
  bn: {
    home: 'হোম', scan: 'নতুন লট', prices: 'দর তালিকা', recyclers: 'রিসাইক্লার',
    handover: 'হস্তান্তর', earnings: 'উপার্জন', safety: 'গাইড এবং নিরাপত্তা', login: 'লগ ইন',
    logout: 'লগ আউট', offline: 'অফলাইন প্রস্তুত',
    heroTitle: 'আপনার স্ক্র্যাপের আসল দাম জানুন।',
    heroSub: 'উপাদান চিনুন। সঠিক স্থানীয় বাজারদর যাচাই করুন। অনুমোদিত রিসাইক্লারের সাথে যুক্ত হন।',
    startLot: '+ নতুন লট শুরু করুন', yourEarnings: 'আপনার উপার্জন', viewLedger: 'হিসাব খাতা →',
    todaysPrices: 'আজকের বাজারদর', seeAll: 'সব দেখুন →', understandMat: 'উপাদান যাচাই করুন',
    scanSub: 'লটের উপাদানের অনুপাত নির্ধারণ করতে ক্যামেরা দিয়ে ছবি তুলুন।',
    takePhoto: '◉ ছবি তুলুন / আপলোড করুন', visibleComp: 'উপাদানের অনুপাত (AI)',
    confirmCont: 'নিশ্চিত করে এগিয়ে যান →', knowRange: 'ন্যায্য স্থানীয় মূল্যসীমা',
    estLotVal: 'আনুমানিক মোট মূল্য', totalMode: 'মোট ওজন মোড', indMode: 'আলাদা আলাদা ওজন মোড',
    approxTotal: 'আনুমানিক মোট ওজন (কেজি)', sellLot: 'লটটি বিক্রি করুন →',
    welcomeCollector: 'সঠিক-রেট এ স্বাগতম',
    welcomeSub: 'স্ক্র্যাপ স্ক্যান করুন, ন্যায্য দাম জানুন এবং নির্ভরযোগ্য রিসাইক্লারের কাছে বিক্রি করুন।'
  }
}

function HistoricalTrendChart({ material }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.trends(material)
      .then((res) => {
        setData(res.history || [])
        setLoading(false)
      })
      .catch(() => {
        setData([])
        setLoading(false)
      })
  }, [material])

  if (loading) return <div className="chart-placeholder"><span className="spinner" /> Loading 6-month historical market trend…</div>
  if (!data.length) return null

  const width = 680
  const height = 190
  const pad = 42

  const prices = data.map((d) => d.price)
  const minP = Math.min(...prices) * 0.95
  const maxP = Math.max(...prices) * 1.05

  const getX = (idx) => pad + (idx / (data.length - 1)) * (width - pad * 2)
  const getY = (price) => height - pad - ((price - minP) / (maxP - minP || 1)) * (height - pad * 2)

  const points = data.map((d, i) => `${getX(i)},${getY(d.price)}`).join(' ')

  return (
    <div className="trend-box glass">
      <div className="trend-head">
        <div>
          <span className="eyebrow">COMMODITY INDEX</span>
          <h3>6-Month Spot Trend: {material}</h3>
        </div>
        <strong className="trend-current">₹{data[data.length - 1].price} <small>/ kg</small></strong>
      </div>
      <div className="svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg">
          <line x1={pad} y1={getY(minP)} x2={width - pad} y2={getY(minP)} stroke="#eee" />
          <line x1={pad} y1={getY((minP + maxP) / 2)} x2={width - pad} y2={getY((minP + maxP) / 2)} stroke="#eee" />
          <line x1={pad} y1={getY(maxP)} x2={width - pad} y2={getY(maxP)} stroke="#eee" />
          <polyline fill="none" stroke="#ff7060" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {data.map((d, i) => (
            (i % 6 === 0 || i === data.length - 1) && (
              <g key={d.date} onMouseEnter={() => setHovered({ x: getX(i), y: getY(d.price), ...d })} onMouseLeave={() => setHovered(null)}>
                <circle cx={getX(i)} cy={getY(d.price)} r="4" fill="#ff7060" className="chart-dot" />
                <text x={getX(i)} y={height - 12} fontSize="10" textAnchor="middle" fill="#888">{d.date}</text>
              </g>
            )
          ))}
          {hovered && (
            <g>
              <line x1={hovered.x} y1={pad} x2={hovered.x} y2={height - pad} stroke="#ff7060" strokeDasharray="3,3" />
              <rect x={hovered.x - 42} y={hovered.y - 30} width="84" height="22" rx="4" fill="#222" />
              <text x={hovered.x} y={hovered.y - 15} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                ₹{hovered.price}/kg
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

function App() {
  const [lang, setLang] = useState('en')
  const t = DICT[lang] || DICT.en

  const [page, setPage] = useState('home')
  const [lotSaved, setLotSaved] = useState(false)
  const [menu, setMenu] = useState(false)
  const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem('sahirate_user') || 'null'))
  const [serverPrices, setServerPrices] = useState([])
  const [currentComposition, setCurrentComposition] = useState({})

  useEffect(() => {
    api.prices().then(setServerPrices).catch(() => setServerPrices([]))
  }, [])

  const go = (next) => {
    setPage(next)
    setMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const authenticate = (session) => {
    localStorage.setItem('sahirate_token', session.token)
    localStorage.setItem('sahirate_user', JSON.stringify(session.user))
    setAccount(session.user)
    go('dashboard')
  }

  const logout = () => {
    localStorage.removeItem('sahirate_token')
    localStorage.removeItem('sahirate_user')
    setAccount(null)
    setCurrentComposition({})
    go('home')
  }

  const guardedGo = (next) => (account ? go(next) : go('auth'))

  const navItems = [
    ['home', '⌂', t.home],
    ['scan', '◉', t.scan],
    ['prices', '₹', t.prices],
    ['recyclers', '⌖', t.recyclers],
    ['handover', '▣', t.handover],
    ['earnings', '◔', t.earnings],
    ['safety', '♢', t.safety]
  ]

  return (
    <div className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go('home')}>
          <span className="brand-mark">S</span>
          <span>Sahi<span>Rate</span></span>
        </button>
        <div className="top-actions">
          <div className="modern-lang-picker">
            <span className="lang-icon">🌐</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language selection">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>
          <span className="online-dot">{t.offline}</span>
          {account ? (
            <>
              <button className="account-button" onClick={() => go('dashboard')}>
                {account.name.split(' ')[0]} · {account.role}
              </button>
              <button className="avatar">{account.name.slice(0, 2).toUpperCase()}</button>
            </>
          ) : (
            <button className="login-top" onClick={() => go('auth')}>{t.login}</button>
          )}
          <button className="mobile-menu" onClick={() => setMenu(!menu)}>☰</button>
        </div>
      </header>

      <div className="app-layout">
        <aside className={`sidebar ${menu ? 'open' : ''}`}>
          <p className="nav-caption">COLLECTOR SPACE</p>
          {navItems.map(([id, icon, label]) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => go(id)}>
              <i>{icon}</i>{label}
            </button>
          ))}
          <div className="side-footer">
            <span>↻</span>
            <div><b>Ready to sync</b><small>0 pending updates</small></div>
          </div>
        </aside>

        <main className="content">
          {page === 'home' && <Home go={go} prices={serverPrices} account={account} t={t} />}
          {page === 'scan' && (
            <Scanner
              t={t}
              onScanComplete={(compositionDict) => {
                setCurrentComposition(compositionDict)
                go('prices')
              }}
            />
          )}
          {page === 'prices' && (
            <Prices
              t={t}
              go={guardedGo}
              saved={lotSaved}
              prices={serverPrices}
              composition={currentComposition}
              account={account}
              onSaveLot={async (payload) => {
                if (!account) return go('auth')
                try {
                  await api.createLot(payload)
                  setLotSaved(true)
                  go('recyclers')
                } catch (err) {
                  alert(err.message)
                }
              }}
            />
          )}
          {page === 'recyclers' && <RecyclerList go={guardedGo} t={t} />}
          {page === 'handover' && <Handover t={t} />}
          {page === 'earnings' && <Earnings t={t} />}
          {page === 'safety' && <GuideSafety t={t} />}
          {page === 'auth' && <Auth onAuth={authenticate} t={t} />}
          {page === 'dashboard' && <RoleDashboard account={account} logout={logout} go={go} t={t} />}
        </main>
      </div>
    </div>
  )
}

function Home({ go, prices, account, t }) {
  return (
    <>
      <section className="hero glass">
        <div>
          <p className="eyebrow">{account ? `NAMASTE, ${account.name.toUpperCase()}` : 'SAHIRATE PORTAL'}</p>
          <h1>{t.heroTitle}</h1>
          <p className="lede">{t.heroSub}</p>
          <button className="primary" onClick={() => go('scan')}>{t.startLot}</button>
        </div>
        <div className="hero-art">
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="hero-symbol">♻</div>
          <span className="float-card f1">✓ AI ready</span>
          <span className="float-card f2">⌁ Works offline</span>
        </div>
      </section>

      <section className="quick-grid">
        <button onClick={() => go('scan')}><i>◉</i><b>{t.scan}</b><small>AI analysis</small></button>
        <button onClick={() => go('prices')}><i>₹</i><b>{t.prices}</b><small>Fair ranges</small></button>
        <button onClick={() => go('recyclers')}><i>⌖</i><b>{t.recyclers}</b><small>Verified buyers</small></button>
        <button onClick={() => go('earnings')}><i>◔</i><b>{t.earnings}</b><small>Ledger history</small></button>
      </section>

      <section className="two-col">
        {account ? (
          <div className="glass panel">
            <div className="panel-head">
              <div><p className="eyebrow">THIS MONTH</p><h2>{t.yourEarnings}</h2></div>
              <button className="link" onClick={() => go('earnings')}>{t.viewLedger}</button>
            </div>
            <strong className="big-money">₹18,400</strong>
            <div className="mini-chart">
              <span style={{ height: '32%' }} /><span style={{ height: '51%' }} /><span style={{ height: '40%' }} />
              <span style={{ height: '72%' }} /><span style={{ height: '57%' }} /><span className="today" style={{ height: '90%' }} />
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Today</span>
            </div>
          </div>
        ) : (
          <div className="glass panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="panel-head">
              <div><p className="eyebrow">INFORMAL TO FORMAL</p><h2>{t.welcomeCollector}</h2></div>
            </div>
            <p className="muted" style={{ lineHeight: '1.6', marginTop: '1rem' }}>{t.welcomeSub}</p>
            <button className="soft" style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }} onClick={() => go('auth')}>
              {t.login} / Register →
            </button>
          </div>
        )}

        <div className="glass panel">
          <div className="panel-head">
            <div><p className="eyebrow">MARKET SNAPSHOT</p><h2>{t.todaysPrices}</h2></div>
            <button className="link" onClick={() => go('prices')}>{t.seeAll}</button>
          </div>
          {(prices.length ? prices.slice(0, 3) : [
            { material: 'WIRE', lowRate: 680, highRate: 740, observations: 24 },
            { material: 'METAL', lowRate: 220, highRate: 280, observations: 18 }
          ]).map((p) => (
            <div className="price-line" key={p.material || p.id}>
              <span className="material-icon">◈</span>
              <div><b>{p.material}</b><small>{p.observations || 18} observations</small></div>
              <strong>₹{p.lowRate ?? p.low_rate} - ₹{p.highRate ?? p.high_rate}/kg</strong>
              <em>↑</em>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Scanner({ onScanComplete, t }) {
  const inputRef = useRef(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [imageUrl, setImageUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('Take a clear photo of the visible scrap material.')
  const [busy, setBusy] = useState(false)
  const [debug, setDebug] = useState(false)

  const set = (key, value) => setSettings((x) => ({ ...x, [key]: Number(value) }))

  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResult(null)
    setBusy(true)
    setStatus('Analysing locally — no photo is sent to a server…')
    try {
      const next = await predict(url, settings)
      setResult(next)
      setStatus(next.composition.length ? 'Visible material estimate ready. Please confirm it.' : 'No material was detected.')
    } catch (error) {
      setStatus(`Analysis error: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = () => {
    if (!result?.composition) return
    const compositionDict = {}
    result.composition.forEach((item) => {
      compositionDict[NAMES[item.classId]] = Number(item.percentage.toFixed(2))
    })
    onScanComplete(compositionDict)
  }

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">NEW LOT · STEP 1 OF 4</p>
          <h1>{t.understandMat}</h1>
          <p>{t.scanSub}</p>
        </div>
        <span className="privacy-chip">◌ Runs on device</span>
      </div>

      <section className="scanner-grid">
        <div className="glass scan-stage">
          {result?.overlayUrl ? (
            <img src={result.overlayUrl} alt="Segmentation overlay" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Selected scrap" />
          ) : (
            <div className="scan-empty">
              <span>◉</span>
              <b>Take a photo of scrap</b>
              <small>Good lighting • One lot at a time</small>
            </div>
          )}
          {busy && <div className="scan-loading"><span className="spinner" />Understanding material…</div>}
          <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={upload} />
          <button className="camera-button" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'ANALYSING…' : t.takePhoto}
          </button>
        </div>

        <aside className="glass composition">
          <div className="panel-head">
            <div><p className="eyebrow">AI ESTIMATE</p><h2>{t.visibleComp}</h2></div>
            {result && <span className="success-chip">✓ Ready</span>}
          </div>
          {result?.composition?.length ? (
            <div className="bars">
              {result.composition.map((item) => (
                <div className="bar-row" key={item.classId}>
                  <div><span className="dot" style={{ background: COLORS[item.classId] }} />{NAMES[item.classId]}</div>
                  <b>{item.percentage.toFixed(1)}%</b>
                  <span className="bar"><i style={{ width: `${item.percentage}%`, background: COLORS[item.classId] }} /></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="composition-empty">Detected classes and percentages appear here.</div>
          )}
          <p className="disclaimer">Visible area composition estimates mass. Physical weights are verified at handover.</p>
          {result && (
            <button className="primary full" onClick={handleConfirm}>{t.confirmCont}</button>
          )}
        </aside>
      </section>

      <p className="scan-status">{status}</p>

      <details className="advanced">
        <summary>Advanced AI settings</summary>
        <div className="settings">
          <label>Confidence {settings.confidenceThreshold.toFixed(2)}
            <input type="range" min="0.05" max=".9" step=".05" value={settings.confidenceThreshold} onChange={(e) => set('confidenceThreshold', e.target.value)} />
          </label>
          <label>NMS IoU {settings.nmsIouThreshold.toFixed(2)}
            <input type="range" min=".1" max=".9" step=".05" value={settings.nmsIouThreshold} onChange={(e) => set('nmsIouThreshold', e.target.value)} />
          </label>
          <label>Mask threshold {settings.maskThreshold.toFixed(2)}
            <input type="range" min=".1" max=".9" step=".05" value={settings.maskThreshold} onChange={(e) => set('maskThreshold', e.target.value)} />
          </label>
        </div>
        {result && (
          <>
            <button className="link" onClick={() => setDebug(!debug)}>{debug ? 'Hide' : 'Show'} model details</button>
            {debug && <pre>{JSON.stringify(result.debug, null, 2)}</pre>}
          </>
        )}
      </details>
    </>
  )
}

function Prices({ go, prices, composition, account, onSaveLot, t }) {
  const [mode, setMode] = useState('total')
  const [totalMassInput, setTotalMassInput] = useState(10)
  const [individualMasses, setIndividualMasses] = useState({})
  const [activeTrendMaterial, setActiveTrendMaterial] = useState('WIRE')

  const hasLot = Object.keys(composition || {}).length > 0
  const canCalculate = Boolean(account && hasLot)

  const ratesMap = useMemo(() => {
    const map = {}
    prices.forEach((p) => {
      const mat = (p.material || '').toUpperCase()
      map[mat] = { low: p.lowRate ?? p.low_rate ?? 0, high: p.highRate ?? p.high_rate ?? 0 }
    })
    return map
  }, [prices])

  const activeMaterials = useMemo(() => {
    if (hasLot) return Object.keys(composition)
    return prices.length > 0 ? prices.map((p) => p.material.toUpperCase()) : NAMES
  }, [composition, prices, hasLot])

  const computedWeights = useMemo(() => {
    const weights = {}
    if (mode === 'total') {
      const total = Number(totalMassInput) || 0
      activeMaterials.forEach((mat) => {
        const pct = composition[mat] ?? (100 / activeMaterials.length)
        weights[mat] = Number(((pct / 100) * total).toFixed(2))
      })
    } else {
      activeMaterials.forEach((mat) => {
        weights[mat] = Number(individualMasses[mat] || 0)
      })
    }
    return weights
  }, [mode, totalMassInput, individualMasses, activeMaterials, composition])

  const effectiveTotalWeight = useMemo(() => Object.values(computedWeights).reduce((sum, w) => sum + w, 0), [computedWeights])

  const { estimatedLow, estimatedHigh } = useMemo(() => {
    let low = 0
    let high = 0
    Object.entries(computedWeights).forEach(([mat, w]) => {
      const rate = ratesMap[mat.toUpperCase()] || { low: 40, high: 60 }
      low += w * rate.low
      high += w * rate.high
    })
    return { estimatedLow: Math.round(low), estimatedHigh: Math.round(high) }
  }, [computedWeights, ratesMap])

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">{canCalculate ? 'NEW LOT · STEP 2 OF 4' : 'MARKET DATA'}</p>
          <h1>{t.knowRange}</h1>
          <p>Values computed dynamically from verified local mandi observations.</p>
        </div>
        <span className="location">⌖ Bhubaneswar</span>
      </div>

      {canCalculate ? (
        <section className="glass price-board">
          <div className="market-range">
            <p className="eyebrow">{t.estLotVal}</p>
            <strong>₹{estimatedLow.toLocaleString()} <small>to ₹{estimatedHigh.toLocaleString()}</small></strong>
            <span>Total Weight: {effectiveTotalWeight.toFixed(1)} kg</span>
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" className={mode === 'total' ? 'primary' : 'soft'} style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => setMode('total')}>{t.totalMode}</button>
              <button type="button" className={mode === 'individual' ? 'primary' : 'soft'} style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => setMode('individual')}>{t.indMode}</button>
            </div>

            {mode === 'total' ? (
              <div className="weight-entry">
                <label>{t.approxTotal}<input type="number" min="0" step="0.5" value={totalMassInput} onChange={(e) => setTotalMassInput(e.target.value)} /></label>
                <button className="primary" onClick={() => onSaveLot({ composition, weights: computedWeights, totalWeight: Number(effectiveTotalWeight.toFixed(2)) })}>{t.sellLot}</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {activeMaterials.map((mat) => (
                  <label key={mat} style={{ fontSize: '12px', display: 'flex', flexDirection: 'column' }}>
                    <b>{mat} (kg)</b>
                    <input type="number" min="0" step="0.1" placeholder="0.0" value={individualMasses[mat] || ''} onChange={(e) => setIndividualMasses({ ...individualMasses, [mat]: e.target.value })} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '4px' }} />
                  </label>
                ))}
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <button className="primary" onClick={() => onSaveLot({ composition, weights: computedWeights, totalWeight: Number(effectiveTotalWeight.toFixed(2)) })}>{t.sellLot}</button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="glass price-board" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Evaluate your lot</h3>
          <p className="muted" style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', lineHeight: '1.5' }}>
            {account ? 'Scan your scrap to automatically calculate its estimated fair value range here.' : 'Log in and scan scrap to compute fair transaction values from verified buyer observations.'}
          </p>
          <button className="primary" onClick={() => go('scan')}>📸 Start a New Scan</button>
        </section>
      )}

      <HistoricalTrendChart material={activeTrendMaterial} />

      <section className="market-list">
        {activeMaterials.map((mat, i) => {
          const rate = ratesMap[mat.toUpperCase()] || { low: 40, high: 60 }
          const pct = hasLot && composition[mat] ? `(${composition[mat]}% of lot)` : ''
          return (
            <article className={`glass market-card ${activeTrendMaterial === mat ? 'selected-material' : ''}`} key={mat} onClick={() => setActiveTrendMaterial(mat)} style={{ cursor: 'pointer' }}>
              <span className="material-icon large">{i === 0 ? '▦' : i === 1 ? '◈' : '◇'}</span>
              <div>
                <p className="eyebrow">LOCAL OBSERVED RANGE {pct}</p>
                <h2>{mat}</h2>
                <small>Click to view 6-month historical trend</small>
              </div>
              <div className="range">
                <b>₹{rate.low} - ₹{rate.high}/kg</b>
                <span><i /><i /><i /><i /><i /></span><em>Current</em>
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}

function RecyclerList({ go }) {
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">NEW LOT · STEP 3 OF 4</p>
          <h1>Choose a verified recycler</h1>
          <p>Only verified facilities that accept your lot are recommended.</p>
        </div>
        <span className="verified">✓ Verified only</span>
      </div>
      <div className="recycler-list">
        {RECYCLERS.map((r) => (
          <article className="glass recycler-card" key={r.name}>
            <div className="recycler-logo">♻</div>
            <div className="recycler-main">
              <span className="rank-tag">{r.tag}</span>
              <h2>{r.name}</h2>
              <p>✓ Authorized e-waste recycler · {r.distance} away</p>
              <div className="chips">
                <span>PCB</span><span>Metal</span><span>Plastic</span>{r.pickup && <span>Pickup</span>}
              </div>
            </div>
            <div className="offer"><small>OFFER RATE</small><b>{r.rate}</b><button className="soft" onClick={() => go('handover')}>Choose →</button></div>
          </article>
        ))}
      </div>
    </>
  )
}

function Handover() {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">HANDOVER</p>
          <h1>Complete with confidence</h1>
          <p>Physical weight and payment are recorded separately from your estimate.</p>
        </div>
      </div>
      <section className="handover-grid">
        <div className="glass handover-card">
          <span className="step-number">1</span>
          <h2>Recycler verifies lot</h2>
          <div className="weight-compare"><div><small>YOUR ESTIMATE</small><b>20.0 kg</b></div><span>→</span><div><small>VERIFIED WEIGHT</small><b>20.4 kg</b></div></div>
          <p className="variance">+0.4 kg · 2% variance</p>
        </div>
        <div className="glass handover-card">
          <span className="step-number">2</span>
          <h2>Scan signed QR</h2>
          <div className="qr-placeholder">▦</div><button className="soft">Open QR scanner</button>
        </div>
        <div className="glass handover-card">
          <span className="step-number">3</span>
          <h2>Confirm payment</h2>
          <div className="payment"><b>₹2,693</b><span>Cash payment</span></div>
          <button className="primary full" onClick={() => setConfirmed(true)}>{confirmed ? '✓ Payment recorded' : 'Confirm handover'}</button>
        </div>
      </section>
    </>
  )
}

function Earnings() {
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">MY EARNINGS</p>
          <h1>Your work, on record</h1>
        </div>
      </div>
      <section className="earnings-cards">
        <div className="glass earnings-card orange"><small>TODAY</small><b>₹1,900</b><span>1 completed handover</span></div>
        <div className="glass earnings-card"><small>THIS WEEK</small><b>₹5,650</b><span>4 completed handovers</span></div>
        <div className="glass earnings-card"><small>ALL TIME</small><b>₹18,400</b><span>12 transaction records</span></div>
      </section>
      <section className="glass ledger">
        <div className="panel-head"><h2>Transaction history</h2><button className="link">Download record</button></div>
        {[
          ['LOT-012', 'EcoCycle Odisha', 'Today · Cash', '₹1,900'],
          ['LOT-011', 'GreenLoop Recyclers', '12 Sep · UPI', '₹1,440']
        ].map((row) => (
          <div className="ledger-row" key={row[0]}><span className="ledger-icon">✓</span><div><b>{row[0]} · {row[1]}</b><small>{row[2]}</small></div><strong>{row[3]}</strong></div>
        ))}
      </section>
    </>
  )
}

function GuideSafety({ t }) {
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">HELP & INSTRUCTIONS</p>
          <h1>{t.safety}</h1>
          <p>Complete lifecycle workflow and safe handling guidelines.</p>
        </div>
      </div>

      <section className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>How SahiRate Works</h2>
        <div className="app-workflow">
          <div className="workflow-step">
            <div className="workflow-icon">📸</div>
            <b>1. Scan</b>
            <small>AI identifies composition</small>
          </div>
          <div className="workflow-arrow">➔</div>
          <div className="workflow-step">
            <div className="workflow-icon">₹</div>
            <b>2. Value</b>
            <small>Discover fair mandi rate</small>
          </div>
          <div className="workflow-arrow">➔</div>
          <div className="workflow-step">
            <div className="workflow-icon">⌖</div>
            <b>3. Match</b>
            <small>Find verified recycler</small>
          </div>
          <div className="workflow-arrow">➔</div>
          <div className="workflow-step">
            <div className="workflow-icon">🤝</div>
            <b>4. Handover</b>
            <small>Signed QR & instant payment</small>
          </div>
        </div>
      </section>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Safe Handling Protocols</h2>
      <section className="safety-grid">
        {[
          ['🔋', 'Battery', 'Never puncture, burn, or dismantle batteries. Store in dry, shaded containers to prevent dangerous lithium fires.'],
          ['▦', 'PCB Boards', 'Never use acid baths or open flames to recover precious metals. Hand over intact for mechanical hydrometallurgy.'],
          ['⌁', 'Wires & Cables', 'Do not burn plastic insulation to expose copper. Stripping mechanically retains the highest grade payment value.'],
          ['◉', 'Displays & CRT', 'Do not shatter vacuum glass. CRT screens contain hazardous phosphor and lead. Transport intact.']
        ].map(([icon, title, text]) => (
          <article className="glass safety-card" key={title}>
            <span className="safety-icon-large">{icon}</span>
            <div className="safety-content">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

function Auth({ onAuth, t }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('collector')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // --- GOOGLE OAUTH CONFIGURATION ---
  // Replace the string below with your actual Client ID!
  const GOOGLE_CLIENT_ID = "60347423348-7aisht4u4no81ji4ph9kl8qoqcg9br6k.apps.googleusercontent.com";

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = mode === 'login' ? await api.login(form.email, form.password) : await api.register({ ...form, role })
      onAuth(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setBusy(true); setError('');
    try {
      const session = await api.googleLogin(credentialResponse.credential, role);
      onAuth(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <section className="auth-wrap">
        <div className="auth-art">
          <span className="brand-mark">S</span>
          <p className="eyebrow">SAHIRATE ACCESS</p>
          <h1>Make formal recycling work for everyone.</h1>
          <p>Log in to submit lots, receive offers, and maintain traceability records.</p>
          <div className="demo-access">
            <b>Test Authority Account (Google Login Blocked)</b>
            <span>authority@sahirate.demo</span>
            <small>Password: demo123</small>
          </div>
        </div>
        <form className="glass auth-card" onSubmit={submit}>
          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>{t.login}</button>
            <button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>

          <label style={{ marginBottom: '1rem', display: 'block' }}>I am a:
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="collector">Collector - sell material</option>
              <option value="recycler">Recycler - buy and verify</option>
              <option value="authority">Authority - manage data</option>
            </select>
          </label>

          {/* Conditionally render Google Login Button */}
          {role !== 'authority' && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
               <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setError('Google Authentication Failed')} 
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                  theme="filled_black"
                  width="100%"
               />
               <div style={{ margin: '15px 0', color: '#888', fontSize: '12px', fontWeight: '600' }}>OR CONTINUE WITH EMAIL</div>
            </div>
          )}

          {mode === 'register' && (<label>Your name<input name="name" required value={form.name} onChange={change} /></label>)}
          <label>Email<input name="email" type="email" required value={form.email} onChange={change} /></label>
          <label>Password<input name="password" type="password" minLength="6" required value={form.password} onChange={change} /></label>
          
          {error && <p className="auth-error">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? 'PLEASE WAIT…' : mode === 'login' ? `${t.login.toUpperCase()} →` : 'CREATE ACCOUNT →'}</button>
        </form>
      </section>
    </GoogleOAuthProvider>
  )
}

function RoleDashboard({ account, logout, go }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    if (!account) return
    const fn = account.role === 'authority' ? api.authority : account.role === 'collector' ? api.collector : null
    if (fn) fn().then(setStats).catch(() => setStats(null))
  }, [account])

  if (!account) return <Auth onAuth={() => {}} />

  return (
    <>
      <div className="page-title"><div><p className="eyebrow">{account.role.toUpperCase()} DASHBOARD</p><h1>Hello, {account.name.split(' ')[0]}</h1><p>{account.role === 'authority' ? 'Maintain trusted market and traceability data.' : account.role === 'recycler' ? 'Review lots, make offers and complete verified handovers.' : 'Continue selling with transparent prices and records.'}</p></div><button className="soft" onClick={logout}>Log out</button></div>
      {account.role === 'authority' ? <AuthorityPanel stats={stats} /> : account.role === 'recycler' ? <RecyclerPanel /> : <CollectorPanel stats={stats} go={go} />}
    </>
  )
}

function CollectorPanel({ stats, go }) { return <><section className="earnings-cards"><div className="glass earnings-card orange"><small>COMPLETED EARNINGS</small><b>₹{stats?.totalEarnings ?? 0}</b><span>{stats?.completedHandovers ?? 0} paid handovers</span></div><div className="glass earnings-card"><small>MY LOTS</small><b>{stats?.lots ?? 0}</b><span>Saved in your account</span></div><div className="glass earnings-card"><small>NEXT STEP</small><b>Sell</b><span>Scan, weigh, compare offers</span></div></section><section className="glass action-panel"><h2>Create a sale lot</h2><button className="primary" onClick={() => go('scan')}>Start a new lot →</button></section></> }
function RecyclerPanel() { return <section className="two-col"><div className="glass panel"><p className="eyebrow">BUYER WORKSPACE</p><h2>Incoming lots</h2><strong className="big-money">0</strong></div><div className="glass panel"><p className="eyebrow">VERIFICATION</p><h2>Handover tools</h2><button className="primary">Review lots →</button></div></section> }
function AuthorityPanel({ stats }) { return <><section className="earnings-cards"><div className="glass earnings-card orange"><small>REGISTERED USERS</small><b>{stats?.users ?? '—'}</b></div><div className="glass earnings-card"><small>LOTS</small><b>{stats?.lots ?? '—'}</b></div><div className="glass earnings-card"><small>AUDIT EVENTS</small><b>{stats?.auditEvents ?? '—'}</b></div></section><section className="glass ledger"><div className="panel-head"><h2>Recent audit activity</h2></div>{stats?.recentAudit?.map((event) => (<div className="ledger-row" key={event.hash}><span className="ledger-icon">✓</span><div><b>{event.type}</b><small>{event.entity} · {event.hash}</small></div><strong>Recorded</strong></div>))}</section></> }

export default App