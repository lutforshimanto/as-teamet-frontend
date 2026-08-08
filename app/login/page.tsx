"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { login } from "@/lib/redux/slices/authSlice";

const schema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(login(data)).unwrap();
      toast({
        title: "Welcome back!",
        description: "You have signed in successfully.",
      });
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AS-Teamet</span>
            </Link>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Controller
                    name="employeeId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="employeeId"
                        placeholder="ADM001"
                        autoComplete="username"
                        disabled={isSubmitting}
                        {...field}
                      />
                    )}
                  />
                  {errors.employeeId && (
                    <p className="text-sm text-destructive">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
