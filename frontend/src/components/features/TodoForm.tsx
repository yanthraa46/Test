import { Save, PlusCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { TodoFormValues } from './types';

interface TodoFormProps {
  mode: 'create' | 'edit';
  values: TodoFormValues;
  titleError?: string;
  loading?: boolean;
  onChange: (field: keyof TodoFormValues, value: string | boolean) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function TodoForm({
  mode,
  values,
  titleError,
  loading = false,
  onChange,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  return (
    <Card className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          {mode === 'create' ? 'Create a new todo' : 'Edit todo'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Capture the task details, due date, priority, and tags in one place.
        </p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Input
          id="todo-title"
          label="Title"
          value={values.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="Prepare product demo"
          required
          aria-required="true"
          error={titleError}
        />

        <Textarea
          id="todo-description"
          label="Description"
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Add helpful context, links, or next steps"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="todo-due-date"
            label="Due date"
            type="date"
            value={values.due_date}
            onChange={(event) => onChange('due_date', event.target.value)}
          />
          <Select
            id="todo-priority"
            label="Priority"
            value={values.priority}
            onChange={(event) => onChange('priority', event.target.value)}
          >
            <option value="">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <Input
          id="todo-tags"
          label="Tags"
          value={values.tags}
          onChange={(event) => onChange('tags', event.target.value)}
          placeholder="design, sprint-12, personal"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading} aria-disabled={loading}>
            {mode === 'create' ? <PlusCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {loading ? 'Saving...' : mode === 'create' ? 'Add todo' : 'Save changes'}
          </Button>
          {onCancel ? (
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
