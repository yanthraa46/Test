from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import todo  # noqa: F401
from app.routers import todos

# API CONTRACT
# POST /api/todos
#   request:  {title: str, description: str|null, due_date: str|null, priority: "low"|"medium"|"high"|null, tags: list[str], completed: bool, position: int|null}
#   response: {id: int, title: str, description: str|null, due_date: str|null, priority: str|null, tags: list[str], completed: bool, position: int}
# GET /api/todos?status=<all|active|completed>&search=<string>
#   response: [{id: int, title: str, description: str|null, due_date: str|null, priority: str|null, tags: list[str], completed: bool, position: int}, ...]
# PUT /api/todos/{id}
#   request:  {title: str, description: str|null, due_date: str|null, priority: "low"|"medium"|"high"|null, tags: list[str], completed: bool, position: int|null}
#   response: {id: int, title: str, description: str|null, due_date: str|null, priority: str|null, tags: list[str], completed: bool, position: int}
# PATCH /api/todos/{id}/toggle
#   response: {id: int, title: str, description: str|null, due_date: str|null, priority: str|null, tags: list[str], completed: bool, position: int}
# DELETE /api/todos/{id}
#   response: 204 No Content
# POST /api/todos/reorder
#   request:  {ordered_ids: list[int]}
#   response: [{id: int, title: str, description: str|null, due_date: str|null, priority: str|null, tags: list[str], completed: bool, position: int}, ...]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.environ.get("CORS_ORIGINS", "*").split(",")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(todos.router)
