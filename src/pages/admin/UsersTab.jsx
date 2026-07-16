import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, CheckCircle, XCircle, ShieldCheck, GraduationCap, BookOpen, ClipboardList, Star, AlertTriangle } from 'lucide-react';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

const ROLE_FILTERS = ['all', 'student', 'faculty'];

function RoleBadge({ role, declaredRole, facultyVerified }) {
  if (role === 'admin') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
      <ShieldCheck size={11} /> Admin
    </span>
  );
  if (role === 'sa') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
      <ClipboardList size={11} /> Student Assistant
    </span>
  );
  if (declaredRole === 'faculty') return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
      ${facultyVerified ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
      <BookOpen size={11} /> Faculty {!facultyVerified && '(Pending)'}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <GraduationCap size={11} /> Student
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-36 bg-gray-100 rounded" /><div className="h-2 w-24 bg-gray-100 rounded mt-1.5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-40 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-20 rounded-full bg-gray-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

// Confirmation Modal Component
function ConfirmSAModal({ open, onClose, onConfirm, user, action }) {
  if (!user) return null;
  const isPromote = action === 'promote';

  return (
    <Modal open={open} onClose={onClose} title={isPromote ? 'Promote to Student Assistant' : 'Remove Student Assistant Role'} maxWidth="max-w-sm">
      <div className="space-y-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto
          ${isPromote ? 'bg-orange-50' : 'bg-red-50'}`}>
          {isPromote
            ? <Star size={28} className="text-orange-500" />
            : <AlertTriangle size={28} className="text-red-500" />
          }
        </div>

        {/* User info */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-ub-gray">{user.student_id} · {user.email}</p>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 text-center">
          {isPromote
            ? <>Are you sure you want to promote <span className="font-semibold">{user.name}</span> to <span className="font-semibold text-orange-600">Student Assistant</span>? They will gain access to manage requests and catalog.</>
            : <>Are you sure you want to remove the <span className="font-semibold text-red-600">Student Assistant</span> role from <span className="font-semibold">{user.name}</span>? They will revert to a regular student account.</>
          }
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold transition cursor-pointer
              ${isPromote ? 'bg-orange-500 hover:bg-orange-600' : 'bg-ub-red hover:bg-ub-darkRed'}`}
          >
            {isPromote ? '⭐ Promote' : 'Remove Role'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState(null); // { user, action: 'promote' | 'demote' }

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let u = users;
    if (roleFilter === 'faculty') u = u.filter(u => u.declared_role === 'faculty');
    else if (roleFilter === 'student') u = u.filter(u => u.declared_role === 'student' && u.role !== 'admin');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      u = u.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return u;
  }, [users, roleFilter, search]);

  const pendingFaculty = users.filter(u => u.declared_role === 'faculty' && !u.faculty_verified).length;

  const approveFaculty = async (userId, name) => {
    const { error } = await supabase.from('users').update({ faculty_verified: true }).eq('id', userId);
    if (error) { toast.error('Failed to approve.'); return; }
    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Faculty Account Approved! ✅',
      message: 'Your faculty account has been verified by the library admin.',
      type: 'approved',
    }]);
    toast.success(`${name}'s faculty account approved!`);
    fetchUsers();
  };

  const rejectFaculty = async (userId, name) => {
    const { error } = await supabase.from('users').update({ faculty_verified: false, declared_role: 'student' }).eq('id', userId);
    if (error) { toast.error('Failed to reject.'); return; }
    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Faculty Request Not Approved',
      message: 'Your faculty account request was not approved. Please contact the library.',
      type: 'rejected',
    }]);
    toast.success(`${name}'s faculty request rejected.`);
    fetchUsers();
  };

  const handleConfirmSA = async () => {
    const { user, action } = confirmModal;
    setConfirmModal(null);

    if (action === 'promote') {
      const { error } = await supabase.from('users').update({ role: 'sa' }).eq('id', user.id);
      if (error) { toast.error('Failed to promote.'); return; }
      await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'You are now a Student Assistant! 🎉',
        message: 'Congratulations! You have been promoted to Student Assistant. Log out and back in to access your new dashboard.',
        type: 'approved',
      }]);
      toast.success(`${user.name} promoted to Student Assistant!`);
    } else {
      const { error } = await supabase.from('users').update({ role: 'student' }).eq('id', user.id);
      if (error) { toast.error('Failed to demote.'); return; }
      await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'SA Role Removed',
        message: 'Your Student Assistant role has been removed. You now have standard student access.',
        type: 'info',
      }]);
      toast.success(`${user.name} demoted to student.`);
    }
    fetchUsers();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-ub-gray mt-1">Review registrations and manage user access.</p>
      </div>

      {pendingFaculty > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <BookOpen size={18} className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{pendingFaculty} faculty registration{pendingFaculty > 1 ? 's' : ''}</span> pending your approval.
          </p>
          <button onClick={() => setRoleFilter('faculty')}
            className="ml-auto text-xs font-semibold text-yellow-700 hover:underline cursor-pointer">
            View →
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none text-sm transition"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map(f => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition cursor-pointer
                ${roleFilter === f ? 'bg-ub-red text-white' : 'bg-white border border-gray-200 text-ub-gray hover:border-ub-red hover:text-ub-red'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <table className="w-full text-sm"><tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody></table>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-ub-gray">{u.student_id}</p>
                    </td>
                    <td className="px-5 py-3 text-ub-gray text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <RoleBadge role={u.role} declaredRole={u.declared_role} facultyVerified={u.faculty_verified} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.declared_role === 'faculty' && !u.faculty_verified && (
                          <>
                            <button onClick={() => approveFaculty(u.id, u.name)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-ub-green px-2.5 py-1 rounded-lg hover:bg-green-50 cursor-pointer">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => rejectFaculty(u.id, u.name)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {u.role === 'student' && (
                          <button
                            onClick={() => setConfirmModal({ user: u, action: 'promote' })}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm shadow-orange-200"
                          >
                            <Star size={12} /> Make SA
                          </button>
                        )}
                        {u.role === 'sa' && (
                          <button
                            onClick={() => setConfirmModal({ user: u, action: 'demote' })}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <XCircle size={12} /> Remove SA
                          </button>
                        )}
                        {u.role === 'admin' && <span className="text-xs text-ub-gray">—</span>}
                        {u.role === 'banned' && <span className="text-xs text-red-500 font-semibold">Banned</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmSAModal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmSA}
        user={confirmModal?.user}
        action={confirmModal?.action}
      />
    </div>
  );
}
