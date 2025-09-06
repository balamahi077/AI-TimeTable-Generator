import React from 'react';
import { Calendar, Users, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Dashboard = ({ timetable }) => {
  const totalCourses = timetable.courses.length;
  const totalTeachers = timetable.teachers.length;
  const totalRooms = timetable.rooms.length;
  const scheduledSlots = Object.keys(timetable.slots).length;
  const conflicts = timetable.checkConflicts();
  const fitness = timetable.calculateFitness();

  const stats = [
    {
      title: 'Total Courses',
      value: totalCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    {
      title: 'Total Teachers',
      value: totalTeachers,
      icon: Users,
      color: 'bg-green-500',
      change: '+1 this week'
    },
    {
      title: 'Available Rooms',
      value: totalRooms,
      icon: Calendar,
      color: 'bg-purple-500',
      change: 'No changes'
    },
    {
      title: 'Scheduled Classes',
      value: scheduledSlots,
      icon: Clock,
      color: 'bg-orange-500',
      change: `+${scheduledSlots} this week`
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'course_added',
      message: 'Data Structures course added',
      time: '2 hours ago',
      icon: BookOpen
    },
    {
      id: 2,
      type: 'teacher_added',
      message: 'Dr. Sarah Johnson added to Computer Science',
      time: '4 hours ago',
      icon: Users
    },
    {
      id: 3,
      type: 'conflict_resolved',
      message: 'Room conflict resolved for CS201',
      time: '6 hours ago',
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'ai_suggestion',
      message: 'AI suggested optimal schedule for ML course',
      time: '1 day ago',
      icon: Calendar
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your timetable management system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Timetable Fitness</p>
            <p className="text-2xl font-bold text-green-600">{fitness}%</p>
          </div>
          {conflicts.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{conflicts.length} conflicts</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-full">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left flex items-center space-x-3">
              <BookOpen className="w-5 h-5" />
              <span>Add New Course</span>
            </button>
            <button className="w-full btn-secondary text-left flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span>Add New Teacher</span>
            </button>
            <button className="w-full btn-secondary text-left flex items-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Schedule Class</span>
            </button>
            <button className="w-full btn-secondary text-left flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Resolve Conflicts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Schedule Conflicts Detected</h3>
              <p className="text-red-700">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} found in your timetable. 
                Please review and resolve them for optimal scheduling.
              </p>
            </div>
          </div>
          <div className="mt-4">
            {conflicts.slice(0, 3).map((conflict, index) => (
              <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded mb-2">
                • {conflict.description}
              </div>
            ))}
            {conflicts.length > 3 && (
              <p className="text-sm text-red-600">... and {conflicts.length - 3} more conflicts</p>
            )}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{fitness}%</p>
            <p className="text-sm text-blue-800">Timetable Fitness</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {Math.round((scheduledSlots / (totalCourses * 3)) * 100)}%
            </p>
            <p className="text-sm text-green-800">Schedule Coverage</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round((totalTeachers / totalCourses) * 100)}%
            </p>
            <p className="text-sm text-purple-800">Teacher Utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
