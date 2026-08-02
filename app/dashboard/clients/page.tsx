'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Pencil, Trash2, Building2, Phone, MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/lib/redux/slices/clientsSlice';
import type { Client } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
});

type FormData = z.infer<typeof schema>;

export default function ClientsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items: clients, status } = useAppSelector((s) => s.clients);
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', phone: '' },
  });

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const openCreate = () => {
    reset({ name: '', address: '', phone: '' });
    setCreateOpen(true);
  };

  const openEdit = (client: Client) => {
    reset({ name: client.name, address: client.address, phone: client.phone });
    setEditClient(client);
  };

  const onCreate = async (data: FormData) => {
    try {
      await dispatch(createClient(data)).unwrap();
      toast({ title: 'Client created', description: `${data.name} has been added.` });
      reset();
      setCreateOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create client';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const onEdit = async (data: FormData) => {
    if (!editClient) return;
    try {
      await dispatch(updateClient({ id: editClient._id, data })).unwrap();
      toast({ title: 'Client updated', description: 'Changes have been saved.' });
      setEditClient(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteClient(deleteId)).unwrap();
      toast({ title: 'Client deleted', description: 'The client has been removed.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage your clients' : 'View client directory'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {status === 'loading' || status === 'idle' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No clients found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client._id} className="flex flex-col">
              <CardContent className="flex-1 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{client.name}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                </div>
              </CardContent>
              {isAdmin && (
                <div className="flex gap-2 border-t px-5 py-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(client)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(client._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Create a new client entry.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <ClientFormFields control={control} errors={errors} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create Client'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
            <ClientFormFields control={control} errors={errors} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditClient(null)} disabled={isSubmitting}>
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
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The client will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClientFormFields({ control, errors }: { control: any; errors: any }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input placeholder="Company or person name" {...field} />}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => <Input placeholder="Full address" {...field} />}
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => <Input placeholder="+45 12 34 56 78" {...field} />}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
    </>
  );
}
