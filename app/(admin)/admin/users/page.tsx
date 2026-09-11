'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Loader2, Users, MoreVertical, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  admin: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15', role: roleFilter });
    if (search) params.set('search', search);
    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.data || []);
        setTotal(d.pagination?.total || 0);
        setPages(d.pagination?.pages || 1);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const toggleActive = async (userId: string, isActive: boolean) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActive: !isActive }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } else {
      toast.error('Failed to update user');
    }
    setActionMenu(null);
  };

  const changeRole = async (userId: string, role: string) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Role updated');
      fetchUsers();
    } else {
      toast.error(data.error || 'Failed to update role');
    }
    setActionMenu(null);
  };

  return (
    <div className="space-y-6" onClick={() => setActionMenu(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm">{total} total users</p>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {['student', 'mentor', 'admin', 'super_admin'].map((role) => (
          <button
            key={role}
            onClick={() => { setRoleFilter(role); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              roleFilter === role
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {role.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['User', 'Role', 'Status', 'Verified', 'Last Login', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user.role] || ''}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.isEmailVerified
                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-muted-foreground" />}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {user.lastLogin ? formatDate(user.lastLogin, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {formatDate(user.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActionMenu(actionMenu === user._id ? null : user._id)}
                          className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenu === user._id && (
                          <div className="absolute right-0 top-8 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                            <button
                              onClick={() => toggleActive(user._id, user.isActive)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              {user.isActive ? 'Deactivate User' : 'Activate User'}
                            </button>
                            <div className="border-t border-border my-1" />
                            {isSuperAdmin ? (
                              <>
                                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assign Role</div>
                                {['student', 'mentor', 'admin', 'super_admin'].map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => changeRole(user._id, role)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors capitalize ${user.role === role ? 'text-primary font-medium' : ''}`}
                                  >
                                    {role.replace('_', ' ')}
                                  </button>
                                ))}
                              </>
                            ) : (
                              <div className="px-3 py-2 text-[11px] text-muted-foreground italic flex items-center gap-1.5 bg-muted/50">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>Role changes require Super Admin access</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
