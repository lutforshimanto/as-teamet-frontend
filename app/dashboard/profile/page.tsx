'use client';

import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Loader2, Save, KeyRound, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    address: user?.address || '',
    phone: user?.phone || '',
    speciality: user?.speciality || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // --- Avatar upload (only touches imageUrl) ---
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoMsg({ type: 'error', text: 'Please select an image file' });
      return;
    }

    setUploadingPhoto(true);
    setPhotoMsg(null);
    // Clear the other cards' messages so nothing feels mixed
    setProfileMsg(null);
    setPasswordMsg(null);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const key = `images/${Date.now()}-${user._id}-avatar.${extension}`;

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('key', key);

      const r2Res = await fetch('/api/upload', { method: 'POST', body: formData });
      const r2Data = await r2Res.json();
      if (!r2Data.success) {
        throw new Error(r2Data.error || 'Failed to upload image');
      }

      const backendRes = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: r2Data.url }), // ← only imageUrl
      });
      const backendData = await backendRes.json();
      if (!backendRes.ok) {
        throw new Error(backendData.message || 'Failed to save profile photo');
      }

      dispatch(setUser(backendData));
      
      setPhotoMsg({ type: 'success', text: 'Profile photo updated.' });
    } catch (err) {
      setPhotoMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload image',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // --- Profile details (never sends imageUrl) ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    setPhotoMsg(null); // clear photo message so “Save changes” never looks like a photo action
    setPasswordMsg(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(form), // only name / phone / address / speciality
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      dispatch(setUser(data));
      // keep local form in sync in case backend normalises anything
      setForm({
        name: data.name ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        speciality: data.speciality ?? '',
      });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setProfileMsg(null);
    setPhotoMsg(null);

    if (passwordForm.password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ password: passwordForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');

      setPasswordForm({ password: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">View and update your account information.</p>
      </div>

      {/* Identity header – photo only */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <button
            type="button"
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            className="group relative h-16 w-16 shrink-0 rounded-full"
            aria-label="Change profile photo"
            disabled={uploadingPhoto}
          >
            <Avatar className="h-16 w-16">
              {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              {uploadingPhoto ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoSelect}
              className="hidden"
              disabled={uploadingPhoto}
            />
          </button>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.employeeId}</p>
            <Badge variant="secondary" className="mt-1 capitalize">{user.role}</Badge>
          </div>
        </CardContent>

        {photoMsg && (
          <CardContent className="pt-0">
            <p
              className={`flex items-center gap-1.5 text-sm ${
                photoMsg.type === 'success' ? 'text-emerald-600' : 'text-destructive'
              }`}
            >
              {photoMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {photoMsg.text}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Profile details – never touches imageUrl */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile details</CardTitle>
          <CardDescription>These are visible to your team in the directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={handleProfileChange('name')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={handleProfileChange('phone')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={handleProfileChange('address')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="speciality">Speciality</Label>
                <Input id="speciality" value={form.speciality} onChange={handleProfileChange('speciality')} />
              </div>
            </div>

            {profileMsg && (
              <p
                className={`flex items-center gap-1.5 text-sm ${
                  profileMsg.type === 'success' ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {profileMsg.text}
              </p>
            )}

            <Button type="submit" disabled={savingProfile || uploadingPhoto}>
              {savingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password – independent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>

            {passwordMsg && (
              <p
                className={`flex items-center gap-1.5 text-sm ${
                  passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {passwordMsg.text}
              </p>
            )}

            <Separator />

            <Button type="submit" variant="secondary" disabled={savingPassword}>
              {savingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}