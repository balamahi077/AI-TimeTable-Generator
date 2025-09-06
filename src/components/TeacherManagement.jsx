import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Clock, Mail } from 'lucide-react';
import { Teacher, generateId } from '../models';

const TeacherManagement = ({ teachers, onAddTeacher, onUpdateTeacher, onDeleteTeacher }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const departments = [...new Set(teachers.map(teacher => teacher.department))];

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || teacher.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Parse availability from form
    const availability = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      const dayAvailability = formData.get(`${day.toLowerCase()}_availability`);
      if (dayAvailability) {
        availability[day] = dayAvailability.split(',').map(time => time.trim()).filter(time => time);
      }
    });

    const teacherData = {
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
      specialization: formData.get('specialization').split(',').map(s => s.trim()).filter(s => s),
      availability: availability,
      maxHoursPerWeek: parseInt(formData.get('maxHoursPerWeek'))
    };

    if (editingTeacher) {
      onUpdateTeacher(editingTeacher.id, teacherData);
      setEditingTeacher(null);
    } else {
      onAddTeacher(teacherData);
    }
    
    setShowAddForm(false);
    e.target.reset();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowAddForm(true);
  };

  const handleDelete = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      onDeleteTeacher(teacherId);
    }
  };

  const timeSlots = [
    '09:30-10:25', '10:25-11:20', '11:30-12:25', '12:25-01:20',
      '02:20-03:15', '03:15-04:10', '04:10-05:05'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-2">Manage teacher profiles, availability, and specializations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingTeacher?.name || ''}
                  required
                  className="input-field"
                  placeholder="e.g., Dr. Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingTeacher?.email || ''}
                  required
                  className="input-field"
                  placeholder="e.g., sarah.johnson@college.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue={editingTeacher?.department || ''}
                  required
                  className="input-field"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hours Per Week
                </label>
                <input
                  type="number"
                  name="maxHoursPerWeek"
                  defaultValue={editingTeacher?.maxHoursPerWeek || ''}
                  min="1"
                  max="60"
                  className="input-field"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <input
                type="text"
                name="specialization"
                defaultValue={editingTeacher?.specialization?.join(', ') || ''}
                className="input-field"
                placeholder="e.g., Data Structures, Algorithms, Machine Learning"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Availability Schedule
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {day}
                    </label>
                    <input
                      type="text"
                      name={`${day.toLowerCase()}_availability`}
                      defaultValue={editingTeacher?.availability?.[day]?.join(', ') || ''}
                      className="input-field"
                      placeholder="e.g., 09:00-10:00, 10:00-11:00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button type="submit" className="btn-primary">
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTeacher(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Teachers ({filteredTeachers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Specializations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Max Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{teacher.name}</td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{teacher.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {teacher.department}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {teacher.specialization.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.specialization.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{teacher.maxHoursPerWeek}h</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit teacher"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No teachers found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
