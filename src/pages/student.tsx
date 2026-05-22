import React, { useState } from 'react';

// Types
interface Student {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  disabilityType: string;
  school: string;
  department: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

interface Course {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  nextSession: string;
}

interface Session {
  id: string;
  courseName: string;
  date: string;
  time: string;
  duration: string;
  attended: boolean;
}

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Student Overview');
  
  // Mock student data
  const student: Student = {
    id: 'STU001',
    username: 'john_doe',
    email: 'john.doe@brailleed.com',
    firstName: 'John',
    lastName: 'Doe',
    age: 16,
    disabilityType: 'Visual Impairment',
    school: 'Nairobi School',
    department: 'Computer Science',
  };

  // Mock courses
  const courses: Course[] = [
    { id: '1', name: 'Robotics Fundamentals', instructor: 'Dr. Sarah', progress: 75, nextSession: '2025-01-20' },
    { id: '2', name: 'Braille Literacy', instructor: 'Mr. Otieno', progress: 60, nextSession: '2025-01-22' },
    { id: '3', name: 'Assistive Technology', instructor: 'Ms. Wangari', progress: 90, nextSession: '2025-01-19' },
  ];

  // Mock assignments
  const assignments: Assignment[] = [
    { id: '1', title: 'Robot Assembly Project', course: 'Robotics Fundamentals', dueDate: '2025-01-25', status: 'pending' },
    { id: '2', title: 'Braille Translation Exercise', course: 'Braille Literacy', dueDate: '2025-01-23', status: 'submitted', grade: 85 },
    { id: '3', title: 'Assistive Tech Review', course: 'Assistive Technology', dueDate: '2025-01-18', status: 'graded', grade: 92 },
  ];

  // Mock sessions
  const sessions: Session[] = [
    { id: '1', courseName: 'Robotics Fundamentals', date: '2025-01-15', time: '10:00 AM', duration: '2 hours', attended: true },
    { id: '2', courseName: 'Braille Literacy', date: '2025-01-16', time: '11:30 AM', duration: '1.5 hours', attended: true },
    { id: '3', courseName: 'Assistive Technology', date: '2025-01-17', time: '09:00 AM', duration: '2 hours', attended: false },
  ];

  // Statistics
  const statistics = {
    totalCourses: 5,
    completedAssignments: 12,
    averageGrade: 87,
    attendanceRate: 92,
    totalSessions: 24,
    attendedSessions: 22,
  };

  const tabs = ['Student Overview', 'My Courses', 'Students', 'Assignments', 'Sessions', 'Analytics', 'Settings'];
  const currentTime = new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const renderContent = () => {
    switch (activeTab) {
      case 'Student Overview':
        return (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium text-gray-600">Name:</span> {student.firstName} {student.lastName}</div>
                <div><span className="font-medium text-gray-600">Username:</span> {student.username}</div>
                <div><span className="font-medium text-gray-600">Email:</span> {student.email}</div>
                <div><span className="font-medium text-gray-600">Age:</span> {student.age}</div>
                <div><span className="font-medium text-gray-600">School:</span> {student.school}</div>
                <div><span className="font-medium text-gray-600">Department:</span> {student.department}</div>
                <div><span className="font-medium text-gray-600">Disability Type:</span> {student.disabilityType}</div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{statistics.totalCourses}</div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{statistics.completedAssignments}</div>
                  <div className="text-sm text-gray-600">Completed Assignments</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{statistics.averageGrade}%</div>
                  <div className="text-sm text-gray-600">Average Grade</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{statistics.attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{statistics.attendedSessions}/{statistics.totalSessions}</div>
                  <div className="text-sm text-gray-600">Sessions Attended</div>
                </div>
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Assignments</h3>
                {assignments.slice(0, 2).map(assignment => (
                  <div key={assignment.id} className="flex justify-between items-center py-2 border-b">
                    <div><div className="font-medium">{assignment.title}</div><div className="text-sm text-gray-500">{assignment.course}</div></div>
                    <span className={`px-2 py-1 rounded text-xs ${assignment.status === 'graded' ? 'bg-green-100 text-green-700' : assignment.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{assignment.status}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Upcoming Sessions</h3>
                {courses.slice(0, 2).map(course => (
                  <div key={course.id} className="py-2 border-b">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-gray-500">Next session: {course.nextSession}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'My Courses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructor}</p>
                <div className="mt-4"><div className="text-sm text-gray-600 mb-1">Progress: {course.progress}%</div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div></div></div>
                <p className="text-sm text-gray-500 mt-3">Next session: {course.nextSession}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">View Course</button>
              </div>
            ))}
          </div>
        );

      case 'Assignments':
        return (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map(assignment => (<tr key={assignment.id}><td className="px-6 py-4">{assignment.title}</td><td className="px-6 py-4">{assignment.course}</td><td className="px-6 py-4">{assignment.dueDate}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${assignment.status === 'graded' ? 'bg-green-100 text-green-700' : assignment.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{assignment.status}</span></td><td className="px-6 py-4">{assignment.grade || '-'}</td></tr>))}
              </tbody>
            </table>
          </div>
        );

      case 'Sessions':
        return (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map(session => (<tr key={session.id}><td className="px-6 py-4">{session.courseName}</td><td className="px-6 py-4">{session.date}</td><td className="px-6 py-4">{session.time}</td><td className="px-6 py-4">{session.duration}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${session.attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{session.attended ? 'Attended' : 'Missed'}</span></td></tr>))}
              </tbody>
            </table>
          </div>
        );

      case 'Analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100"><h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3><div className="space-y-3"><div><div className="flex justify-between text-sm"><span>Assignments Completion</span><span>92%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div></div></div><div><div className="flex justify-between text-sm"><span>Attendance Rate</span><span>92%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div></div></div><div><div className="flex justify-between text-sm"><span>Average Grade</span><span>87%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div></div></div></div></div>
              <div className="bg-white rounded-xl p-6 border border-gray-100"><h3 className="font-semibold text-gray-800 mb-4">Course Progress</h3><div className="space-y-4">{courses.map(course => (<div key={course.id}><div className="flex justify-between text-sm"><span>{course.name}</span><span>{course.progress}%</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div></div></div>))}</div></div>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
            <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label><select className="w-full border border-gray-300 rounded-lg p-2"><option>All notifications</option><option>Only assignments</option><option>None</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Language</label><select className="w-full border border-gray-300 rounded-lg p-2"><option>English</option><option>Swahili</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Theme</label><select className="w-full border border-gray-300 rounded-lg p-2"><option>Light</option><option>Dark</option></select></div><button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Changes</button></div>
          </div>
        );

      default:
        return <div className="text-center py-10 text-gray-500">Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Ribbon */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 overflow-x-auto whitespace-nowrap">
            <div className="flex space-x-1 sm:space-x-4">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg ml-4">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;