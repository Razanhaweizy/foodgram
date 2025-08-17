from fastapi import FastAPI
from backend.routers import auth   # ensure __init__.py exports router

app = FastAPI()
app.include_router(auth.router)
