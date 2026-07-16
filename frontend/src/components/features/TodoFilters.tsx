import { Filter, Search, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { TodoStatusFilter } from './types';

interface TodoFiltersProps {
  status: TodoStatusFilter;
  search: string;
  total: number;
  completed: number;
  active: number;
  loading?: boolean;
  onStatusChange: (status: TodoStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

const filterOptions: TodoStatusFilter[] = ['all', 'active', 'completed'];

export function TodoFilters({
  status,
  search,
  total,
  completed,
  active,
  loading = false,
  onStatusChange,
  onSearchChange,
  onReset,
}: TodoFiltersProps) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Todo status filters">
            {filterOptions.map((option) => {
              const isActive = option === status;
              return (
                <Button
                  key={option}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onStatusChange(option)}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[360px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="todo-search"
              label="Search todos"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by title, description, or tag"
              className="pl-9"
            />
          </div>
          <div className="sm:pt-7">
            <Button variant="ghost" onClick={onReset} disabled={loading} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="muted">Total {total}</Badge>
        <Badge tone="success">Completed {completed}</Badge>
        <Badge tone="default">Active {active}</Badge>
      </div>
    </Card>
  );
}
