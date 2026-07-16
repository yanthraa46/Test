from datetime import date

from pydantic import BaseModel, Field, field_validator


class TodoBase(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None
    due_date: str | None = None
    priority: str | None = None
    tags: list[str] = Field(default_factory=list)
    completed: bool = False
    position: int | None = None

    @field_validator("title")
    @classmethod
    def _title_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("title must not be empty")
        return value

    @field_validator("due_date")
    @classmethod
    def _validate_due_date(cls, value: str | None) -> str | None:
        if value is None:
            return value
        date.fromisoformat(value)
        return value

    @field_validator("priority")
    @classmethod
    def _validate_priority(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if value not in {"low", "medium", "high"}:
            raise ValueError("priority must be low, medium, high, or null")
        return value

    @field_validator("tags")
    @classmethod
    def _validate_tags(cls, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise ValueError("tags must be an array")
        if any(not isinstance(tag, str) for tag in value):
            raise ValueError("tags must contain only strings")
        return value


class TodoCreate(TodoBase):
    pass


class TodoUpdate(TodoBase):
    pass


class TodoReorder(BaseModel):
    ordered_ids: list[int]


class TodoOut(BaseModel):
    id: int
    title: str
    description: str | None
    due_date: str | None
    priority: str | None
    tags: list[str]
    completed: bool
    position: int

    model_config = {"from_attributes": True}
