import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import api from '../services/api';

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getUsers({ 
        q: search, 
        role: role || undefined, 
        page, 
        pageSize 
      });
      setUsers(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to load users:', error);
      window.alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, role, page]);

  useEffect(() => {
    setPage(1);
  }, [search, role]);

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      return;
    }

    try {
      await api.admin.toggleUserActive(user.id, user.isActive);
      window.alert(`User ${action}d successfully`);
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user:', error);
      window.alert(`Failed to ${action} user`);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-bold">Manage Users</h3>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="Student">Students</option>
          <option value="Teacher">Teachers</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="pb-3 text-gray-300">Name</th>
              <th className="pb-3 text-gray-300">Email</th>
              <th className="pb-3 text-gray-300">Role</th>
              <th className="pb-3 text-gray-300">Status</th>
              <th className="pb-3 text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{user.name}</td>
                  <td className="py-3 text-gray-300">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'Student' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        user.isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-400 text-sm">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}