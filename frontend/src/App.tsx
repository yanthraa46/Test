import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ListTodo, LoaderCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { TodoFilters } from './components/features/TodoFilters';
import { TodoForm } from './components/features/TodoForm';
import { TodoList } from './components/features/TodoList';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  reorderTodos,
  toggleTodo,
  updateTodo,
} from './components/features/todoApi';
import type { Todo, TodoFormValues, TodoPayload, TodoStatusFilter } from './components/features/types';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

const defaultFormValues: TodoFormValues = {
  title: '',
  description: '',
  due_date: '',
  priority: '',
  tags: '',
  completed: false,
};

function normalizeTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toPayload(values: TodoFormValues, position: number | null): TodoPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim() ? values.description.trim() : null,
    due_date: values.due_date || null,
    priority: values.priority || null,
    tags: normalizeTags(values.tags),
    completed: values.completed,
    position,
  };
}

function toFormValues(todo: Todo): TodoFormValues {
  return {
    title: todo.title,
    description: todo.description ?? '',
    due_date: todo.due_date ?? '',
    priority: todo.priority ?? '',
    tags: todo.tags.join(', '),
    completed: todo.completed,
  };
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = window.localStorage.getItem('brightcone-theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<TodoStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [formValues, setFormValues] = useState<TodoFormValues>(defaultFormValues);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | undefined>();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('brightcone-theme', theme);
  }, [theme]);

  async function loadTodos(nextStatus = status, nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos(nextStatus, nextSearch);
      setTodos(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load todos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTodos(status, search);
  }, [status, search]);

  const counts = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    return {
      total: todos.length,
      completed,
      active: todos.length - completed,
    };
  }, [todos]);

  function updateFormField(field: keyof TodoFormValues, value: string | boolean) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (field === 'title') {
      setTitleError(undefined);
    }
  }

  async function handleSubmit() {
    if (!formValues.title.trim()) {
      setTitleError('A title is required.');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, toPayload(formValues, editingTodo.position));
        setTodos((current) => current.map((todo) => (todo.id === updated.id ? updated : todo)));
      } else {
        const created = await createTodo(toPayload(formValues, todos.length));
        setTodos((current) => [...current, created].sort((a, b) => Number(a.position) - Number(b.position)));
      }
      setFormValues(defaultFormValues);
      setEditingTodo(null);
      await loadTodos();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save todo.');
    } finally {
      setFormLoading(false);
    }
  }

  function handleEdit(todo: Todo) {
    setEditingTodo(todo);
    setFormValues(toFormValues(todo));
    setTitleError(undefined);
  }

  async function handleToggle(todo: Todo) {
    setBusyId(todo.id);
    setError(null);
    try {
      const updated = await toggleTodo(todo.id);
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update status.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(todo: Todo) {
    const confirmed = window.confirm(`Delete \"${todo.title}\"?`);
    if (!confirmed) return;

    setBusyId(todo.id);
    setError(null);
    try {
      await deleteTodo(todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
      if (editingTodo?.id === todo.id) {
        setEditingTodo(null);
        setFormValues(defaultFormValues);
      }
      await loadTodos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete todo.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(todo: Todo, direction: 'up' | 'down') {
    const currentIndex = todos.findIndex((item) => item.id === todo.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= todos.length) {
      return;
    }

    const reordered = [...todos];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setReorderBusy(true);
    setError(null);
    setTodos(reordered);

    try {
      const persisted = await reorderTodos(reordered.map((item) => item.id));
      setTodos(persisted.sort((a, b) => Number(a.position) - Number(b.position)));
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Unable to reorder todos.');
      await loadTodos();
    } finally {
      setReorderBusy(false);
    }
  }

  function handleCancelEdit() {
    setEditingTodo(null);
    setFormValues(defaultFormValues);
    setTitleError(undefined);
  }

  function handleResetFilters() {
    setStatus('all');
    setSearch('');
  }

  return (
    <AppShell
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="space-y-4 bg-gradient-to-br from-primary/10 via-card to-accent/10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Single-user workspace
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-balance">Stay on top of every task with calm, visible progress.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Create, prioritize, search, and reorder todos with durable server-backed state and a focused daily workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active</p>
                <p className="mt-2 text-2xl font-semibold">{counts.active}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Completed</p>
                <p className="mt-2 text-2xl font-semibold">{counts.completed}</p>
              </div>
            </div>
          </Card>

          <TodoForm
            mode={editingTodo ? 'edit' : 'create'}
            values={formValues}
            titleError={titleError}
            loading={formLoading}
            onChange={updateFormField}
            onSubmit={handleSubmit}
            onCancel={editingTodo ? handleCancelEdit : undefined}
          />
        </div>

        <div className="space-y-6">
          <TodoFilters
            status={status}
            search={search}
            total={counts.total}
            completed={counts.completed}
            active={counts.active}
            loading={loading}
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onReset={handleResetFilters}
          />

          {error ? (
            <Card className="border-destructive/40 bg-destructive/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-foreground">Something needs attention</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => void loadTodos()}>
                  <RefreshCcw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ListTodo className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Your todo list</h2>
                <p className="text-sm text-muted-foreground">
                  Use the up and down controls on desktop to persist a manual order.
                </p>
              </div>
            </div>
            {loading || reorderBusy ? (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {reorderBusy ? 'Saving new order...' : 'Loading todos...'}
              </div>
            ) : null}
          </Card>

          <TodoList
            todos={todos}
            loading={loading}
            busyId={busyId}
            reorderBusy={reorderBusy}
            emptyMessage={
              search || status !== 'all'
                ? 'Try changing the active filters or search query to see more results.'
                : 'Create your first todo to start building momentum.'
            }
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={(todo, direction) => void handleMove(todo, direction)}
          />
        </div>
      </div>
    </AppShell>
  );
}
