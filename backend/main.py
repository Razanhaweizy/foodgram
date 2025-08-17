from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth
import backend.models
from backend.models.base import Base
from backend.database import engine
from backend.models import user, recipes, likes, saved_recipe

Base.metadata.create_all(bind=engine)

app = FastAPI()

#Allowed origins
origins = [
    "http://localhost:5173",    # Vite dev server
    "http://127.0.0.1:5173",    # sometimes you’ll use this instead
    "http://localhost:3000",    # CRA dev server
    "http://127.0.0.1:3000",
    # "https://foodgram.example.com",  #add production domain(s) here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # safe list, not "*"
    allow_credentials=True,      #if using cookies / auth headers
    allow_methods=["*"],         # allow all HTTP methods
    allow_headers=["*"],         # allow all headers (Authorization, Content-Type, etc.)
)

def on_startup():
    Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth.router)
