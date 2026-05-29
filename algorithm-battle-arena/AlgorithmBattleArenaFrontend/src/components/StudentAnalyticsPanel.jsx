import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Clock, Trophy, Code, Target } from 'lucide-react';
import apiService from '../services/api';

const MetricCard = ({ icon, label, value, color = 'blue' }) => (
  <div className={`bg-gradient-to-br from-${color}-800/50 to-${color}-900/50 backdrop-blur-sm border border-${color}-500/30 rounded-xl p-4`}>
    {icon}
    <h4 className="text-sm font-medium text-gray-300 mt-2">{label}</h4>
    <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
  </div>
);

const StudentAnalyticsPanel = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiService.students.getByStatus('accepted');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAnalytics = async (studentId) => {
    try {
      setLoading(true);
      const [analyticsRes, submissionsRes] = await Promise.all([
        apiService.students.getAnalytics(studentId),
        apiService.students.getSubmissionHistory(studentId)
      ]);
      setAnalytics(analyticsRes.data);
      setSubmissions(submissionsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setAnalytics(null);
    setSubmissions([]);
    await fetchStudentAnalytics(student.studentId);
  };

  if (loading && !selectedStudent) {
    return <div className="text-white">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Student Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <button
              key={student.studentId}
              onClick={() => handleStudentSelect(student)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedStudent?.studentId === student.studentId
                  ? 'bg-purple-600/50 border-purple-400'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="text-white font-medium">{student.firstName} {student.lastName}</div>
              <div className="text-gray-300 text-sm">{student.email}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Display */}
      {selectedStudent && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="text-white text-center">Loading analytics for {selectedStudent.firstName} {selectedStudent.lastName}...</div>
            </div>
          ) : analytics ? (
            <>
              {/* Performance Metrics */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Performance Overview - {selectedStudent.firstName} {selectedStudent.lastName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<Target className="w-6 h-6 text-green-400" />}
                label="Success Rate"
                value={`${analytics.successRate.toFixed(1)}%`}
                color="green"
              />
              <MetricCard
                icon={<BarChart className="w-6 h-6 text-blue-400" />}
                label="Total Submissions"
                value={analytics.totalSubmissions}
                color="blue"
              />
              <MetricCard
                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                label="Problems Solved"
                value={`${analytics.problemsSolved}/${analytics.problemsAttempted}`}
                color="yellow"
              />
              <MetricCard
                icon={<Code className="w-6 h-6 text-purple-400" />}
                label="Preferred Language"
                value={analytics.preferredLanguage}
                color="purple"
              />
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-300 text-sm">Problem</th>
                    <th className="text-left py-2 text-gray-300 text-sm">Language</th>
                    <th className="text-left py-2 text-gray-300 text-sm">Status</th>
                    <th className="text-left py-2 text-gray-300 text-sm">Score</th>
                    <th className="text-left py-2 text-gray-300 text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 10).map((submission, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-2 text-white text-sm">{submission.problemTitle}</td>
                      <td className="py-2 text-gray-300 text-sm">{submission.language}</td>
                      <td className="py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.score > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300 text-sm">{submission.score || 0}</td>
                      <td className="py-2 text-gray-300 text-sm">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="text-white text-center">No analytics data available for {selectedStudent.firstName} {selectedStudent.lastName}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsPanel;