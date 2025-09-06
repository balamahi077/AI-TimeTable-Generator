import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Course, generateId } from '../models';

const CourseManagement = ({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const departments = [...new Set(courses.map(course => course.department))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || course.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      name: formData.get('name'),
      code: formData.get('code'),
      credits: parseInt(formData.get('credits')),
      department: formData.get('department'),
      prerequisites: formData.get('prerequisites').split(',').map(p => p.trim()).filter(p => p),
      maxStudents: parseInt(formData.get('maxStudents'))
    };

    if (editingCourse) {
      onUpdateCourse(editingCourse.id, courseData);
      setEditingCourse(null);
    } else {
      onAddCourse(courseData);
    }
    
    setShowAddForm(false);
    e.target.reset();
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowAddForm(true);
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      onDeleteCourse(courseId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage courses, prerequisites, and scheduling requirements</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
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
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCourse?.name || ''}
                  required
                  className="input-field"
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="code"
                  defaultValue={editingCourse?.code || ''}
                  required
                  className="input-field"
                  placeholder="e.g., CS201"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits *
                </label>
                <input
                  type="number"
                  name="credits"
                  defaultValue={editingCourse?.credits || ''}
                  required
                  min="1"
                  max="6"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue={editingCourse?.department || ''}
                  required
                  className="input-field"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <input
                  type="text"
                  name="prerequisites"
                  defaultValue={editingCourse?.prerequisites?.join(', ') || ''}
                  className="input-field"
                  placeholder="e.g., CS101, MATH101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  defaultValue={editingCourse?.maxStudents || ''}
                  min="1"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button type="submit" className="btn-primary">
                {editingCourse ? 'Update Course' : 'Add Course'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCourse(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Courses ({filteredCourses.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Credits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Max Students</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Prerequisites</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-blue-600">{course.code}</td>
                  <td className="py-3 px-4">{course.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {course.department}
                    </span>
                  </td>
                  <td className="py-3 px-4">{course.credits}</td>
                  <td className="py-3 px-4">{course.maxStudents}</td>
                  <td className="py-3 px-4">
                    {course.prerequisites.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.prerequisites.map((prereq, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No courses found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
