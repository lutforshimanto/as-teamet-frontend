'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock3, ImageIcon, Loader2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/lib/redux/hooks';
import type { Task, User } from '@/lib/types';

export default function TaskViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const authToken = useAppSelector((state) => state.auth.token);
  const users = useAppSelector((state) => state.users.items);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      if (!params?.id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/tasks/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to load task details');
        }

        const data = await res.json();
        setTask(data.task ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    void loadTask();
  }, [authToken, params?.id]);

  const totalHours = useMemo(() => {
    return (task?.hoursLogged || []).reduce((sum, entry) => sum + (entry.hours || 0), 0);
  }, [task]);

  const getEmployeeLabel = (entry: Task['hoursLogged'][number]) => {
    const employeeId = entry.employee || entry.employeeId;
    if (!employeeId) {
      return 'Unknown employee';
    }

    const match = users.find((user) => user._id === employeeId || user.employeeId === employeeId);
    if (!match) {
      return employeeId;
    }

    return `${match.name} (${match.employeeId})`;
  };

  const renderClient = (client: Task['client']) => {
    if (typeof client === 'string') {
      return 'Client selected';
    }

    return (
      <div className="space-y-1">
        <p className="font-medium">{client.name}</p>
        <p className="text-sm text-muted-foreground">{client.address}</p>
        <p className="text-sm text-muted-foreground">{client.phone}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{error || 'Task not found.'}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Badge variant="secondary" className="capitalize">{task.status.replace('-', ' ')}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl capitalize">{task.taskType.replace('-', ' ')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{task.description || 'No description provided.'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Client</p>
              {renderClient(task.client)}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Total hours
              </div>
              <p className="mt-2 text-2xl font-semibold">{totalHours.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User2 className="h-4 w-4" />
                Employees needed
              </div>
              <p className="mt-2 text-2xl font-semibold">{task.numEmployees}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                Photos
              </div>
              <p className="mt-2 text-2xl font-semibold">{task.photos?.length || 0}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium">Hours logged</h3>
            {task.hoursLogged?.length ? (
              <div className="space-y-2">
                {task.hoursLogged.map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{entry.date}</p>
                        <p className="text-xs text-muted-foreground">{getEmployeeLabel(entry)}</p>
                      </div>
                      <Badge variant="outline">{entry.hours}h</Badge>
                    </div>
                    {entry.startTime && entry.endTime ? (
                      <p className="mt-1 text-muted-foreground">{entry.startTime} - {entry.endTime}</p>
                    ) : null}
                    {entry.notes ? <p className="mt-1 text-muted-foreground">{entry.notes}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hours logged yet.</p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium">Photos</h3>
            {task.photos?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {task.photos.map((photo) => (
                  <a key={photo} href={photo} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border">
                    <img src={photo} alt="Task photo" className="aspect-square w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No photos attached yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
