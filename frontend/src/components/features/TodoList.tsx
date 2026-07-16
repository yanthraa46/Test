import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { Todo } from './types';

interface TodoListProps {
  todos: Todo[];
  loading?: boolean;
  emptyMessage: string;
  busyId?: number | null;
  reorderBusy?: boolean;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onMove: (todo: Todo, direction: 'up' | 'down') => void;
}

const priorityTone: Record<'low' | 'medium' | 'high', 'muted' | 'warning' | 'danger'> = {
  low: 'muted',
  medium: 'warning',
  high: 'danger',
};

function formatDueDate(value: string | null) {
  if (!value) return 'No due date';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function TodoList({
  todos,
  loading = false,
  emptyMessage,
  busyId,
  reorderBusy = false,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: TodoListProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-4">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <Card className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">No todos found</h3>
          <p className="max-w-md text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {todos.map((todo, index) => {
        const isBusy = busyId === todo.id;
        return (
          <Card
            key={todo.id}
            className={[
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow',
              todo.completed ? 'border-primary/40 bg-primary/5' : '',
            ].join(' ')}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-1 gap-3">
                <div className="hidden pt-1 text-muted-foreground md:block" aria-hidden="true">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 rounded-full"
                      aria-label={todo.completed ? `Mark ${todo.title} incomplete` : `Mark ${todo.title} complete`}
                      onClick={() => onToggle(todo)}
                      disabled={isBusy}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={[
                            'text-lg font-semibold',
                            todo.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                          ].join(' ')}
                        >
                          {todo.title}
                        </h3>
                        <Badge tone={todo.completed ? 'success' : 'default'}>
                          {todo.completed ? 'Completed' : 'Active'}
                        </Badge>
                        {todo.priority ? <Badge tone={priorityTone[todo.priority]}>{todo.priority}</Badge> : null}
                      </div>
                      {todo.description ? (
                        <p className="text-sm leading-6 text-muted-foreground">{todo.description}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          {formatDueDate(todo.due_date)}
                        </span>
                        {todo.tags.length > 0 ? (
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            {todo.tags.map((tagName) => (
                              <Badge key={tagName} tone="muted" className="normal-case tracking-normal">
                                {tagName}
                              </Badge>
                            ))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMove(todo, 'up')}
                  disabled={index === 0 || reorderBusy}
                  aria-label={`Move ${todo.title} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                  Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMove(todo, 'down')}
                  disabled={index === todos.length - 1 || reorderBusy}
                  aria-label={`Move ${todo.title} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                  Down
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(todo)} disabled={isBusy}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(todo)} disabled={isBusy}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
