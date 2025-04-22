import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import create_engine
import strawberry
from strawberry.fastapi import GraphQLRouter
from minio import Minio


DATABASE_URL = os.getenv("DATABASE_URL")
MINIO_ACCESS_KEY = os.getenv("S3_ACCESS_KEY_ID")
MINIO_SECRET_KEY = os.getenv("S3_SECRET_ACCESS_KEY")

engine = create_engine(DATABASE_URL)


app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MinIO client
minio_client = Minio(
    "minio:9000",
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

# Define your GraphQL schema
@strawberry.type
class Query:
    hello: str

    @strawberry.field
    async def hello(self) -> str:
        return "Hello, World!"

schema = strawberry.Schema(query=Query)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
async def read_root():
    return {"Hello": "World"}

# Add more routes and database interactions as needed
