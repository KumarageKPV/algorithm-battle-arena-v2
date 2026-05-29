import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ManageStudentsPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const pending = await api.students.getByStatus('Pending');
      const approved = await api.students.getByStatus('Accepted');
      setPendingStudents(pending.data);
      setApprovedStudents(approved.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.students.acceptRequest(requestId);
      fetchStudents();
    } catch (error) {
      console.error('Failed to accept student request', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.students.rejectRequest(requestId);
      fetchStudents();
    } catch (error) {
      console.error('Failed to reject student request', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/teacher" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-center">Manage Warriors</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Pending Requests</h2>
            <div className="space-y-4">
              {pendingStudents.map(student => (
                <div key={student.requestId} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{student.username}</p>
                    <p className="text-sm text-gray-400">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(student.requestId)} className="px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 text-sm">Accept</button>
                    <button onClick={() => handleReject(student.requestId)} className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 text-sm">Reject</button>
                  </div>
                </div>
              ))}
              {pendingStudents.length === 0 && <p className="text-gray-400">No pending requests.</p>}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Warriors</h2>
            <div className="space-y-4">
              {approvedStudents.map(student => (
                <div key={student.studentId} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <p className="font-semibold">{student.username}</p>
                  <p className="text-sm text-gray-400">{student.email}</p>
                </div>
              ))}
              {approvedStudents.length === 0 && <p className="text-gray-400">No approved students yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
