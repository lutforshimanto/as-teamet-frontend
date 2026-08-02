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
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addPhoto, logHours, updateTask, updateTaskProgress } from '@/lib/redux/slices/tasksSlice';
import type { Client, Task, TaskStatus, User } from '@/lib/types';
import { normalizeAssignedEmployeeIds } from '@/lib/utils';

interface FormData {
  status: TaskStatus;
  startDate: string;
  endDate: string;
  description?: string;
  numEmployees?: number;
  clientId: string;
  assignedEmployeeIds: string[];
}

interface Props {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  clients: Client[];
  users: User[];
}

export function TaskProgressDialog({ task, open, onOpenChange, isAdmin, clients, users }: Props) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentTask = useAppSelector((state) => state.tasks.items.find((item) => item._id === task._id) ?? task);
  const initialClientId = typeof currentTask.client === 'string' ? currentTask.client : currentTask.client?._id || '';
  const employees = users.filter((user) => user.role === 'employee' || user.role === 'admin');
  const currentAssignedEmployeeIds = normalizeAssignedEmployeeIds(currentTask.assignedEmployees || []);

  const {
    control,
    handleSubmit,
    reset,
    watch: watchTask,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      status: currentTask.status,
      startDate: currentTask.startDate ? currentTask.startDate.split('T')[0] : '',
      endDate: currentTask.endDate ? currentTask.endDate.split('T')[0] : '',
      description: currentTask.description,
      numEmployees: currentTask.numEmployees,
      clientId: initialClientId,
      assignedEmployeeIds: currentAssignedEmployeeIds,
    },
  });

  const {
    register: registerHours,
    handleSubmit: handleHoursSubmit,
    reset: resetHours,
    watch: watchHours,
    formState: { isSubmitting: isHoursSubmitting },
  } = useForm<{ date: string; startTime: string; endTime: string; notes: string }>({
    defaultValues: { date: '', startTime: '', endTime: '', notes: '' },
  });

  const startTime = watchHours('startTime');
  const endTime = watchHours('endTime');
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
    if (!open) return;

    reset({
      status: currentTask.status,
      startDate: currentTask.startDate ? currentTask.startDate.split('T')[0] : '',
      endDate: currentTask.endDate ? currentTask.endDate.split('T')[0] : '',
      description: currentTask.description,
      numEmployees: currentTask.numEmployees,
      clientId: typeof currentTask.client === 'string' ? currentTask.client : currentTask.client?._id || '',
      assignedEmployeeIds: normalizeAssignedEmployeeIds(currentTask.assignedEmployees || []),
    });
  }, [open, currentTask, reset]);

  const onSubmit = async (data: FormData) => {
    const assignedEmployeeIds = data.assignedEmployeeIds || [];
    const uniqueEmployeeIds = new Set(assignedEmployeeIds);
    if (uniqueEmployeeIds.size !== assignedEmployeeIds.length) {
      toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot include the same employee twice.' });
      return;
    }

    if ((assignedEmployeeIds.length || 0) > (data.numEmployees || 0)) {
      toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot exceed the number of employees required for this task.' });
      return;
    }

    try {
      let resultAction;
      if (isAdmin) {
        resultAction = await dispatch(
          updateTask({
            id: currentTask._id,
            data: {
              status: data.status,
              startDate: data.startDate || undefined,
              endDate: data.endDate || undefined,
              description: data.description,
              numEmployees: data.numEmployees,
              client: data.clientId || undefined,
              assignedEmployees: data.assignedEmployeeIds || [],
            } as any,
          })
        );
      } else {
        resultAction = await dispatch(
          updateTaskProgress({
            id: currentTask._id,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            status: data.status,
          })
        );
      }

      if (updateTask.fulfilled.match(resultAction) || updateTaskProgress.fulfilled.match(resultAction)) {
        const payload = 'payload' in resultAction ? resultAction.payload : undefined;
        toast({ title: 'Task updated', description: payload?.message || 'Changes have been saved.' });
        onOpenChange(false);
        return;
      }

      const message = resultAction.payload?.message || resultAction.error.message || 'Failed to update task';
      toast({ variant: 'destructive', title: 'Error', description: message });
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
      const resultAction = await dispatch(logHours({
        id: currentTask._id,
        data: {
          date: data.date,
          hours,
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes || undefined,
          employee: currentUser?._id,
          employeeId: currentUser?.employeeId,
        },
      }));

      if (logHours.fulfilled.match(resultAction)) {
        toast({ title: 'Hours logged', description: resultAction.payload.message || 'The time entry has been added.' });
        resetHours({ date: '', startTime: '', endTime: '', notes: '' });
        return;
      }

      const message = resultAction.payload?.message || resultAction.error.message || 'Failed to log hours';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log hours';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const onAddPhoto = async (data: { photoUrl: string }) => {
    try {
      const resultAction = await dispatch(addPhoto({
        id: currentTask._id,
        photoUrl: data.photoUrl,
        employee: currentUser?._id,
        employeeId: currentUser?.employeeId,
      }));

      if (addPhoto.fulfilled.match(resultAction)) {
        toast({ title: 'Photo added', description: resultAction.payload.message || 'The photo has been attached to the task.' });
        resetPhoto({ photoUrl: '' });
        return;
      }

      const message = resultAction.payload?.message || resultAction.error.message || 'Failed to add photo';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add photo';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="capitalize">{currentTask.taskType.replace('-', ' ')}</DialogTitle>
          <DialogDescription>
            {isAdmin ? 'Edit task details' : 'Update task progress'} — {typeof currentTask.client === 'string' ? 'Client selected' : currentTask.client.name}
          </DialogDescription>
        </DialogHeader>

        {/* Task info */}
        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <StatusBadge status={currentTask.status} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1 text-sm">{currentTask.description}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Employees needed</span>
            <span className="font-medium">{currentTask.numEmployees}</span>
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
                <Label htmlFor="clientId">Assign Client</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name} {'<>'} {client.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Assign Employees</Label>
                <Controller
                  name="assignedEmployeeIds"
                  control={control}
                  render={({ field }) => {
                    const selectedEmployeeIds = normalizeAssignedEmployeeIds(field.value && field.value.length > 0 ? field.value : currentTask.assignedEmployees || []);
                    const availableEmployees = employees.filter((employee) => !selectedEmployeeIds.includes(employee._id));

                    return (
                      <div className="space-y-3 rounded-md border p-3">
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const nextValue = [...selectedEmployeeIds, value];

                            const uniqueValues = new Set(nextValue);
                            if (uniqueValues.size !== nextValue.length) {
                              toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot include the same employee twice.' });
                              return;
                            }

                            if (nextValue.length > (watchTask('numEmployees') || 0)) {
                              toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot exceed the number of employees required for this task.' });
                              return;
                            }

                            field.onChange(nextValue);
                          }}
                          disabled={availableEmployees.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={availableEmployees.length > 0 ? 'Select an employee' : 'All employees assigned'} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableEmployees.map((employee) => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.name} {'<>'} {employee.employeeId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedEmployeeIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedEmployeeIds.map((employeeId) => {
                              const employee = employees.find((item) => item._id === employeeId);
                              if (!employee) return null;

                              return (
                                <div key={employee._id} className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-sm">
                                  <span>{employee.name}</span>
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => field.onChange(selectedEmployeeIds.filter((id) => id !== employee._id))}
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No employees selected yet.</p>
                        )}
                      </div>
                    );
                  }}
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

        {currentUser && (
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
