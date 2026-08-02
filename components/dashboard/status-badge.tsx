import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
