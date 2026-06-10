'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Save, Camera, Loader2 } from 'lucide-react';
import { profileUpdateSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { generateInitials } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfileForm {
  name: string;
  phone?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user?.name || '',
      phone: '',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        await update({ name: data.name });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information</p>
      </div>

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-syne font-bold text-2xl">
              {user?.name ? generateInitials(user.name) : <User className="w-8 h-8" />}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border-2 border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div>
            <h3 className="font-syne font-bold text-foreground text-lg">{user?.name}</h3>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <span className="mt-1 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {(user as { role?: string })?.role || 'student'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-syne font-semibold text-foreground mb-5">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              {...register('name')}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="10-digit mobile number"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
          </div>

          <Button type="submit" variant="gradient" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-syne font-semibold text-foreground mb-4">Security</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-foreground">Password</div>
            <div className="text-xs text-muted-foreground">Change your account password</div>
          </div>
          <Button variant="outline" size="sm">Change Password</Button>
        </div>
      </motion.div>
    </div>
  );
}
