"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Shield, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchUsers,
  createUser,
  deleteUser,
} from "@/lib/redux/slices/usersSlice";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  address: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().min(1, "Role is required"),
  speciality: z.string().min(1, "Speciality is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { items: users, status } = useAppSelector((s) => s.users);
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      employeeId: "",
      address: "",
      phone: "",
      role: "employee",
      speciality: "",
      password: "",
    },
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      toast({
        title: "User created",
        description: `${data.name} has been added.`,
      });
      reset();
      setCreateOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      toast({ variant: "destructive", title: "Error", description: message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteUser(deleteId)).unwrap();
      toast({
        title: "User deleted",
        description: "The user has been removed.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user";
      toast({ variant: "destructive", title: "Error", description: message });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Team Members
            <Badge variant="secondary" className="ml-2">
              {users.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" || status === "idle" ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Speciality</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.employeeId}</TableCell>
                        <TableCell className="capitalize">
                          {u.speciality}
                        </TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              u.role === "admin"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-secondary text-secondary-foreground"
                            }
                          >
                            {u.role === "admin" ? (
                              <Shield className="mr-1 h-3 w-3" />
                            ) : (
                              <UserIcon className="mr-1 h-3 w-3" />
                            )}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(u._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {users.map((u) => (
                  <div key={u._id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{u.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {u.employeeId}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          u.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {u.role}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-muted-foreground">{u.speciality}</p>
                      <p className="text-muted-foreground">{u.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(u._id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new team member account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Full name" {...field} />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="EMP005" {...field} />
                  )}
                />
                {errors.employeeId && (
                  <p className="text-sm text-destructive">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input placeholder="Address" {...field} />
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="+45 12 34 56 78" {...field} />
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="speciality">Speciality</Label>
              <Controller
                name="speciality"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Moving & Transport">
                        Moving & Transport
                      </SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Garbage Collection">
                        Garbage Collection
                      </SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.speciality && (
                <p className="text-sm text-destructive">
                  {errors.speciality.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    {...field}
                  />
                )}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be permanently
              removed.
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
