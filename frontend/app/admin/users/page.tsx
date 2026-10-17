'use client';

import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id: number, role: 'CUSTOMER' | 'ADMIN') => {
    if (!confirm(`Change this user's role to ${role}?`)) return;
    setActionId(id);
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Role updated ✅');
      await load();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setActionId(null);
    }
  };

  const handleToggleBlock = async (id: number, isBlocked: boolean) => {
    const action = isBlocked ? 'Unblock' : 'Block';
    if (!confirm(`${action} this user?`)) return;
    setActionId(id);
    try {
      await api.patch(`/users/${id}/block`);
      toast.success(`User ${action.toLowerCase()}ed ✅`);
      await load();
    } catch {
      toast.error('Failed to update');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Accounts
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Registered <span className="gradient-text">Users</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {users.length} user{users.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl text-xs sm:text-sm border-primary/15"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <UsersIcon className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">No users found</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/10 bg-white overflow-hidden">
          <div className="divide-y divide-primary/5">
            {filtered.map((user) => {
              const isAdmin = user.role === 'ADMIN';
              const busy = actionId === user.id;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isAdmin
                        ? 'bg-gradient-to-br from-primary to-accent text-white'
                        : 'bg-secondary text-primary'
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs truncate">
                        {user.name}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                          <Shield className="h-2.5 w-2.5" />
                          ADMIN
                        </span>
                      )}
                      {user.isBlocked && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-[10px] text-muted-foreground">
                        {user.phone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Role toggle */}
                    <button
                      onClick={() =>
                        handleRoleChange(
                          user.id,
                          isAdmin ? 'CUSTOMER' : 'ADMIN',
                        )
                      }
                      disabled={busy}
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      title={isAdmin ? 'Demote to Customer' : 'Promote to Admin'}
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isAdmin ? (
                        <ShieldOff className="h-3.5 w-3.5" />
                      ) : (
                        <Shield className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Block toggle */}
                    <button
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      disabled={busy}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                        user.isBlocked
                          ? 'hover:bg-green-100 hover:text-green-600'
                          : 'hover:bg-amber-100 hover:text-amber-600'
                      }`}
                      title={user.isBlocked ? 'Unblock user' : 'Block user'}
                    >
                      {user.isBlocked ? (
                        <UserCheck className="h-3.5 w-3.5" />
                      ) : (
                        <UserX className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={busy}
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}