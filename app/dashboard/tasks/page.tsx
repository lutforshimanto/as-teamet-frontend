'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, CalendarDays, ListTodo, Loader2, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { TaskFormDialog } from '@/components/dashboard/task-form-dialog';
import { TaskProgressDialog } from '@/components/dashboard/task-progress-dialog';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchClients } from '@/lib/redux/slices/clientsSlice';
import { fetchTasks, setFilter } from '@/lib/redux/slices/tasksSlice';
import { fetchUsers } from '@/lib/redux/slices/usersSlice';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { items: tasks, status, filter } = useAppSelector((s) => s.tasks);
  const { items: clients } = useAppSelector((s) => s.clients);
  const { items: users } = useAppSelector((s) => s.users);
  const [createOpen, setCreateOpen] = useState(false);
  const [progressTask, setProgressTask] = useState<Task | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchClients());

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (filter === 'month') {
      dispatch(fetchTasks({ month: monthStr }));
    } else if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dispatch(fetchTasks({ startDate: today, endDate: today }));
    } else {
      dispatch(fetchTasks());
    }
  }, [dispatch, filter]);

  const handleFilterChange = (value: string) => {
    dispatch(setFilter(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage all tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="today" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Today</span>
          </TabsTrigger>
          <TabsTrigger value="month" className="gap-1.5">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">This Month</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filter === 'today' ? "Today's Tasks" : filter === 'month' ? 'This Month' : 'All Tasks'}
            <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' || status === 'idle' ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No tasks found.
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium capitalize">
                          {task.taskType.replace('-', ' ')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {typeof task.client === 'string' ? 'Client selected' : task.client.name}
                            </p>
                            {typeof task.client !== 'string' && (
                              <p className="text-xs text-muted-foreground">{task.client.address}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{task.numEmployees}</TableCell>
                        <TableCell><StatusBadge status={task.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/tasks/view/${task._id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setProgressTask(task)}
                            >
                              {isAdmin ? 'Edit' : 'Update'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium capitalize">{task.taskType.replace('-', ' ')}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {typeof task.client === 'string' ? 'Client selected' : task.client.name}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {task.numEmployees} employees needed
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/tasks/view/${task._id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProgressTask(task)}
                        >
                          {isAdmin ? 'Edit' : 'Update'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} clients={clients} users={users} />
      )}

      {progressTask && (
        <TaskProgressDialog
          task={progressTask}
          open={!!progressTask}
          onOpenChange={(open) => !open && setProgressTask(null)}
          isAdmin={isAdmin}
          clients={clients}
          users={users}
        />
      )}
    </div>
  );
}
