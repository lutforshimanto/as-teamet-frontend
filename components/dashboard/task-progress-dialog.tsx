'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addPhoto, logHours, updateTask, updateTaskProgress } from '@/lib/redux/slices/tasksSlice';
import type { Task, TaskStatus } from '@/lib/types';

interface FormData {
  status: TaskStatus;
  startDate: string;
  endDate: string;
  description?: string;
  numEmployees?: number;
}

interface Props {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}

export function TaskProgressDialog({ task, open, onOpenChange, isAdmin }: Props) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      status: task.status,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      description: task.description,
      numEmployees: task.numEmployees,
    },
  });

  const {
    register: registerHours,
    handleSubmit: handleHoursSubmit,
    reset: resetHours,
    watch,
    formState: { isSubmitting: isHoursSubmitting },
  } = useForm<{ date: string; startTime: string; endTime: string; notes: string }>({
    defaultValues: { date: '', startTime: '', endTime: '', notes: '' },
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const computedHours = (() => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const diffMinutes = endTotalMinutes - startTotalMinutes;

    return diffMinutes > 0 ? Number((diffMinutes / 60).toFixed(2)) : 0;
  })();

  const {
    register: registerPhoto,
    handleSubmit: handlePhotoSubmit,
    reset: resetPhoto,
    formState: { isSubmitting: isPhotoSubmitting },
  } = useForm<{ photoUrl: string }>({
    defaultValues: { photoUrl: '' },
  });

  useEffect(() => {
    reset({
      status: task.status,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      description: task.description,
      numEmployees: task.numEmployees,
    });
  }, [task, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isAdmin) {
        await dispatch(
          updateTask({
            id: task._id,
            data: {
              status: data.status,
              startDate: data.startDate || undefined,
              endDate: data.endDate || undefined,
              description: data.description,
              numEmployees: data.numEmployees,
            } as any,
          })
        ).unwrap();
      } else {
        await dispatch(
          updateTaskProgress({
            id: task._id,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            status: data.status,
          })
        ).unwrap();
      }
      toast({ title: 'Task updated', description: 'Changes have been saved.' });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const onLogHours = async (data: { date: string; startTime: string; endTime: string; notes: string }) => {
    const hours = computedHours;

    if (!data.date || !data.startTime || !data.endTime || hours <= 0) {
      toast({ variant: 'destructive', title: 'Invalid time range', description: 'Please enter a valid start and end time.' });
      return;
    }

    try {
      await dispatch(logHours({
        id: task._id,
        data: {
          date: data.date,
          hours,
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes || undefined,
        },
      })).unwrap();
      toast({ title: 'Hours logged', description: 'The time entry has been added.' });
      resetHours({ date: '', startTime: '', endTime: '', notes: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log hours';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const onAddPhoto = async (data: { photoUrl: string }) => {
    try {
      await dispatch(addPhoto({ id: task._id, photoUrl: data.photoUrl })).unwrap();
      toast({ title: 'Photo added', description: 'The photo has been attached to the task.' });
      resetPhoto({ photoUrl: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add photo';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="capitalize">{task.taskType.replace('-', ' ')}</DialogTitle>
          <DialogDescription>
            {isAdmin ? 'Edit task details' : 'Update task progress'} — {typeof task.client === 'string' ? 'Client selected' : task.client.name}
          </DialogDescription>
        </DialogHeader>

        {/* Task info */}
        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1 text-sm">{task.description}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Employees needed</span>
            <span className="font-medium">{task.numEmployees}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="numEmployees">Employees Needed</Label>
                <Controller
                  name="numEmployees"
                  control={control}
                  render={({ field }) => <Input type="number" min={1} {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Textarea {...field} />}
                />
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>

        {!isAdmin && (
          <div className="space-y-4 rounded-lg border bg-secondary/20 p-4">
            <div>
              <h4 className="font-medium">Quick updates</h4>
              <p className="text-sm text-muted-foreground">Add hours or a photo for this task.</p>
            </div>

            <form onSubmit={handleHoursSubmit(onLogHours)} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hoursDate">Date</Label>
                  <Input type="date" {...registerHours('date', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursStartTime">Start Time</Label>
                  <Input type="time" {...registerHours('startTime', { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hoursEndTime">End Time</Label>
                  <Input type="time" {...registerHours('endTime', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursValue">Auto Hours</Label>
                  <Input type="text" value={computedHours.toFixed(2)} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursNotes">Notes</Label>
                <Textarea placeholder="Add notes for the hour entry" {...registerHours('notes')} />
              </div>
              <Button type="submit" variant="outline" disabled={isHoursSubmitting}>
                {isHoursSubmitting ? 'Saving...' : 'Log Hours'}
              </Button>
            </form>

            <form onSubmit={handlePhotoSubmit(onAddPhoto)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input placeholder="https://example.com/photo.jpg" {...registerPhoto('photoUrl', { required: true })} />
              </div>
              <Button type="submit" variant="outline" disabled={isPhotoSubmitting}>
                {isPhotoSubmitting ? 'Saving...' : 'Add Photo'}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
