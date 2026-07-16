export type TodoPriority = 'low' | 'medium' | 'high' | null;
export type TodoStatusFilter = 'all' | 'active' | 'completed';

export type Todo = {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TodoPriority;
  tags: string[];
  completed: boolean;
  position: number;
};

export type TodoPayload = {
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TodoPriority;
  tags: string[];
  completed: boolean;
  position: number | null;
};

export type TodoFormValues = {
  title: string;
  description: string;
  due_date: string;
  priority: '' | 'low' | 'medium' | 'high';
  tags: string;
  completed: boolean;
};
