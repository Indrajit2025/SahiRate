from fastapi import FastAPI

app = FastAPI(
    title="SahiRate API",
    description="Backend for the SIH 26229 Kabadiwala Connect platform",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "SahiRate API is running",
        "project": "SIH 26229 - Kabadiwala Connect",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }