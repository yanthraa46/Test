from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoOut, TodoReorder, TodoUpdate

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

router = APIRouter(prefix="/api/todos", tags=["todos"])


def _to_out(todo: Todo) -> TodoOut:
    return TodoOut(
        id=todo.id,
        title=todo.title,
        description=todo.description,
        due_date=todo.due_date.isoformat() if todo.due_date else None,
        priority=todo.priority,
        tags=todo.tags,
        completed=todo.completed,
        position=todo.position,
    )


@router.post("", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
async def create_todo(body: TodoCreate, db: Session = Depends(get_db)) -> TodoOut:
    max_position = db.query(Todo.position).order_by(Todo.position.desc()).first()
    position = body.position if body.position is not None else ((max_position[0] if max_position and max_position[0] is not None else 0) + 1)
    todo = Todo(
        title=body.title,
        description=body.description,
        due_date=date.fromisoformat(body.due_date) if body.due_date else None,
        priority=body.priority,
        tags=body.tags,
        completed=body.completed,
        position=position,
    )
    db.add(todo)
    db.flush()
    return _to_out(todo)


@router.get("", response_model=list[TodoOut])
async def list_todos(
    status: str = Query(default="all", pattern="^(all|active|completed)$"),
    search: str = Query(default=""),
    db: Session = Depends(get_db),
) -> list[TodoOut]:
    query = db.query(Todo)
    if status == "active":
        query = query.filter(Todo.completed.is_(False))
    elif status == "completed":
        query = query.filter(Todo.completed.is_(True))
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(or_(Todo.title.ilike(like), Todo.description.ilike(like)))
    todos = query.order_by(Todo.position.asc(), Todo.id.asc()).all()
    return [_to_out(todo) for todo in todos]


@router.put("/{todo_id}", response_model=TodoOut)
async def update_todo(todo_id: int, body: TodoUpdate, db: Session = Depends(get_db)) -> TodoOut:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail={"error": "todo not found"})
    todo.title = body.title
    todo.description = body.description
    todo.due_date = date.fromisoformat(body.due_date) if body.due_date else None
    todo.priority = body.priority
    todo.tags = body.tags
    todo.completed = body.completed
    todo.position = body.position if body.position is not None else todo.position
    return _to_out(todo)


@router.patch("/{todo_id}/toggle", response_model=TodoOut)
async def toggle_todo(todo_id: int, db: Session = Depends(get_db)) -> TodoOut:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail={"error": "todo not found"})
    todo.completed = not todo.completed
    return _to_out(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> Response:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail={"error": "todo not found"})
    db.delete(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/reorder", response_model=list[TodoOut])
async def reorder_todos(body: TodoReorder, db: Session = Depends(get_db)) -> list[TodoOut]:
    if not body.ordered_ids:
        raise HTTPException(status_code=422, detail={"error": "ordered_ids must be a non-empty array"})
    todos = db.query(Todo).filter(Todo.id.in_(body.ordered_ids)).all()
    if len(todos) != len(body.ordered_ids):
        raise HTTPException(status_code=422, detail={"error": "ordered_ids must reference every todo exactly once"})
    lookup = {todo.id: todo for todo in todos}
    for index, todo_id in enumerate(body.ordered_ids, start=1):
        lookup[todo_id].position = index
    ordered = db.query(Todo).order_by(Todo.position.asc(), Todo.id.asc()).all()
    return [_to_out(todo) for todo in ordered]
