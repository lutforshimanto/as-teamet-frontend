'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ListTodo,
  Users,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTasks } from '@/lib/redux/slices/tasksSlice';
import { fetchUsers } from '@/lib/redux/slices/usersSlice';
import { fetchClients } from '@/lib/redux/slices/clientsSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items: tasks, status: tasksStatus } = useAppSelector((s) => s.tasks);
  const { items: users } = useAppSelector((s) => s.users);
  const { items: clients } = useAppSelector((s) => s.clients);

  useEffect(() => {
    dispatch(fetchTasks());
    if (user?.role === 'admin') {
      dispatch(fetchUsers());
      dispatch(fetchClients());
    }
  }, [dispatch, user]);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(
    (t) => (t.startDate && t.startDate.split('T')[0] === today) || t.status === 'pending'
  );
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const stats = [
    {
      label: "Today's Tasks",
      value: todayTasks.length,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: ListTodo,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: ListTodo,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none">{stat.value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin extra cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{users.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Team Members</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/users">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{clients.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Clients</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/clients">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
            <CardDescription>Your latest assigned and active tasks</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/tasks">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tasksStatus === 'loading' || tasksStatus === 'idle' ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No tasks for today. Check back later.
            </p>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  href="/dashboard/tasks"
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize">
                      {task.taskType.replace('-', ' ')}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {typeof task.client === 'string' ? 'Client selected' : task.client.name}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
