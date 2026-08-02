'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { createTask } from '@/lib/redux/slices/tasksSlice';
import type { Client, User } from '@/lib/types';

const schema = z.object({
  taskType: z.string().min(1, 'Task type is required'),
  numEmployees: z.coerce.number().min(1, 'At least 1 employee'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  assignedEmployeeIds: z.array(z.string()).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  users: User[];
}

export function TaskFormDialog({ open, onOpenChange, clients, users }: Props) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskType: 'moving',
      numEmployees: 1,
      description: '',
      clientId: '',
      assignedEmployeeIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const employees = users.filter((user) => user.role === 'employee' || user.role === 'admin');
  const isAdmin = currentUser?.role === 'admin';

  const onSubmit = async (data: FormData) => {
    const selectedClient = clients.find((client) => client._id === data.clientId);
    const assignedEmployeeIds = data.assignedEmployeeIds || [];
    const selfAssigned = isAdmin && currentUser ? [currentUser._id] : [];
    const assignedEmployees = assignedEmployeeIds.length > 0
      ? assignedEmployeeIds
      : selfAssigned.length > 0
        ? selfAssigned
        : [];

    const uniqueEmployeeIds = new Set(assignedEmployees);
    if (uniqueEmployeeIds.size !== assignedEmployees.length) {
      toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot include the same employee twice.' });
      return;
    }

    if (assignedEmployees.length > data.numEmployees) {
      toast({ variant: 'destructive', title: 'Invalid selection', description: 'Assigned employees cannot exceed the number of employees required for this task.' });
      return;
    }

    try {
      const resultAction = await dispatch(
        createTask({
          taskType: data.taskType as any,
          numEmployees: data.numEmployees,
          description: data.description,
          assignedEmployees,
          client: selectedClient?._id,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'pending' as const,
        })
      );

      if (createTask.fulfilled.match(resultAction)) {
        toast({ title: 'Task created', description: resultAction.payload.message || 'The new task has been created.' });
        reset();
        onOpenChange(false);
        return;
      }

      const message = resultAction.payload?.message || resultAction.error.message || 'Failed to create task';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Controller
                name="taskType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moving">Moving</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="garbage-collection">Garbage Collection</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.taskType && <p className="text-sm text-destructive">{errors.taskType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numEmployees">Employees Needed</Label>
              <Controller
                name="numEmployees"
                control={control}
                render={({ field }) => (
                  <Input type="number" min={1} {...field} />
                )}
              />
              {errors.numEmployees && <p className="text-sm text-destructive">{errors.numEmployees.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea placeholder="Describe the task..." {...field} />
              )}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assign Employees</Label>
            <Controller
              name="assignedEmployeeIds"
              control={control}
              render={({ field }) => {
                const selectedEmployeeIds = (field.value || []) as string[];
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

                        if (nextValue.length > (watch('numEmployees') || 0)) {
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
