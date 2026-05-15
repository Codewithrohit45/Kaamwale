import { useState, useEffect, useContext } from 'react';
import { FiSearch, FiTrash2, FiUser, FiUsers } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (error) {
        console.error('Error fetching users', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchUsers();
  }, [user]);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? All their bookings will be cancelled.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };
  
  const handleToggleVerify = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isVerified: data.isVerified } : u));
      }
    } catch (err) {
      console.error('Verification toggle failed', err);
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    users: users.filter(u => u.role === 'user').length,
    providers: users.filter(u => u.role === 'provider').length,
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">{stats.total} total &bull; {stats.users} users &bull; {stats.providers} providers</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'user', 'provider', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${roleFilter === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">User</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Email</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Role</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Category</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Joined</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.image || `https://ui-avatars.com/api/?name=${u.name.replace(' ','+')}&background=random&size=40`} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-slate-800 text-sm truncate">{u.name}</span>
                        {u.isVerified && (
                          <svg className="w-4 h-4 text-indigo-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'provider' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.role === 'provider' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.isVerified ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{u.category || '—'}</td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {u.role === 'provider' && (
                        <button
                          onClick={() => handleToggleVerify(u._id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.isVerified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">No users match your search.</div>
        )}
      </div>
    </div>
  );
}
