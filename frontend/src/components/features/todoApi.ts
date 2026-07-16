import type { Todo, TodoPayload, TodoStatusFilter } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const data = (await response.json()) as { detail?: string };
      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      message = response.status === 204 ? 'Request failed.' : response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function fetchTodos(status: TodoStatusFilter, search: string) {
  const params = new URLSearchParams({ status, search });
  return request<Todo[]>(`/api/todos?${params.toString()}`);
}

export function createTodo(payload: TodoPayload) {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTodo(id: number, payload: TodoPayload) {
  return request<Todo>(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function toggleTodo(id: number) {
  return request<Todo>(`/api/todos/${id}/toggle`, {
    method: 'PATCH',
  });
}

export function deleteTodo(id: number) {
  return request<void>(`/api/todos/${id}`, {
    method: 'DELETE',
  });
}

export function reorderTodos(orderedIds: number[]) {
  return request<Todo[]>('/api/todos/reorder', {
    method: 'POST',
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}
