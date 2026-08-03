'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3, ImageIcon, Loader2, User2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchUserDirectory } from '@/lib/redux/slices/usersSlice';
import type { Task } from '@/lib/types';

// --- Lightbox component ---
function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length);
  const goNext = () => onIndexChange((index + 1) % photos.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={photos[index]}
        alt={`Task photo ${index + 1}`}
        className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export default function TaskViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((state) => state.auth.token);
  const { items: users, status: usersStatus } = useAppSelector((state) => state.users);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch users on mount — a page refresh wipes the Redux store, and this
  // page has no other guarantee that `users.items` is populated.
  useEffect(() => {
    dispatch(fetchUserDirectory());
  }, [dispatch]);

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

    // Users haven't loaded yet — show a placeholder instead of the raw ID
    // so we never flash the ID string while fetchUsers is in flight.
    if (usersStatus === 'loading' || usersStatus === 'idle') {
      return 'Loading…';
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
                {task.photos.map((photo, index) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="overflow-hidden rounded-lg border"
                  >
                    <img src={photo} alt="Task photo" className="aspect-square w-full object-cover transition hover:opacity-80" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No photos attached yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {lightboxIndex !== null && task.photos && (
        <PhotoLightbox
          photos={task.photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}