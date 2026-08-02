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
import { useAppDispatch } from '@/lib/redux/hooks';
import { createTask } from '@/lib/redux/slices/tasksSlice';
import type { Client, User } from '@/lib/types';

const schema = z.object({
  taskType: z.string().min(1, 'Task type is required'),
  numEmployees: z.coerce.number().min(1, 'At least 1 employee'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  assignedEmployeeId: z.string().optional(),
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskType: 'moving',
      numEmployees: 1,
      description: '',
      clientId: '',
      assignedEmployeeId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const employees = users.filter((user) => user.role === 'employee');

  const onSubmit = async (data: FormData) => {
    const selectedClient = clients.find((client) => client._id === data.clientId);
    const assignedEmployee = users.find((user) => user._id === data.assignedEmployeeId);

    try {
      await dispatch(
        createTask({
          taskType: data.taskType as any,
          numEmployees: data.numEmployees,
          description: data.description,
          assignedEmployees: assignedEmployee ? [assignedEmployee._id] : [],
          client: selectedClient?._id,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'pending' as const,
        })
      ).unwrap();
      toast({ title: 'Task created', description: 'The new task has been created.' });
      reset();
      onOpenChange(false);
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignedEmployeeId">Assign Employee</Label>
              <Controller
                name="assignedEmployeeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name} {'<>'} {employee.employeeId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Select Client</Label>
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
          </div>

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
