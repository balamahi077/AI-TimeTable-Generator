import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Edit, Trash2, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../models';

const TimetableView = ({ timetable, onScheduleClass, onRemoveClass }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    courseId: '',
    teacherId: '',
    roomId: ''
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot && scheduleData.courseId && scheduleData.teacherId && scheduleData.roomId) {
      onScheduleClass(selectedSlot.day, selectedSlot.time, scheduleData.courseId, scheduleData.teacherId, scheduleData.roomId);
      setShowScheduleForm(false);
      setSelectedSlot(null);
      setScheduleData({ courseId: '', teacherId: '', roomId: '' });
    }
  };

  const handleSlotClick = (day, time) => {
    const existingSlot = timetable.getSlot(day, time);
    if (existingSlot) {
      // Show edit/remove options for existing slot
      if (window.confirm('This slot is occupied. Do you want to remove the current class?')) {
        onRemoveClass(day, time);
      }
    } else {
      // Show schedule form for empty slot
      setSelectedSlot({ day, time });
      setShowScheduleForm(true);
    }
  };

  const getSlotContent = (day, time) => {
    const slot = timetable.getSlot(day, time);
    if (!slot) return null;

    return (
      <div className="p-2 bg-blue-100 rounded border border-blue-300">
        <div className="text-xs font-medium text-blue-800">{slot.course.code}</div>
        <div className="text-xs text-blue-700">{slot.course.name}</div>
        <div className="text-xs text-blue-600">{slot.teacher.name}</div>
        <div className="text-xs text-blue-600">{slot.room.name}</div>
      </div>
    );
  };

  const getSlotClass = (day, time) => {
    const slot = timetable.getSlot(day, time);
    const conflicts = timetable.checkConflicts();
    const hasConflict = conflicts.some(conflict => 
      conflict.slots.some(s => s.day === day && s.time === time)
    );

    if (hasConflict) {
      return 'timetable-cell-conflict';
    } else if (slot) {
      return 'timetable-cell-occupied';
    } else {
      return 'timetable-cell';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable View</h1>
          <p className="text-gray-600 mt-2">Visual schedule with drag-and-drop functionality</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Fitness:</span> {timetable.calculateFitness()}%
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Conflicts:</span> {timetable.checkConflicts().length}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Conflict</span>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 p-3 text-left font-medium text-gray-700 border border-gray-300 bg-gray-50">
                  Time
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="p-3 text-center font-medium text-gray-700 border border-gray-300 bg-gray-50 min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time}>
                  <td className="p-3 text-sm font-medium text-gray-700 border border-gray-300 bg-gray-50">
                    {time}
                  </td>
                  {DAYS_OF_WEEK.map(day => (
                    <td
                      key={`${day}-${time}`}
                      className={`${getSlotClass(day, time)} cursor-pointer hover:shadow-md transition-all duration-200`}
                      onClick={() => handleSlotClick(day, time)}
                    >
                      {getSlotContent(day, time)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Class - {selectedSlot?.day} {selectedSlot?.time}
            </h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={scheduleData.courseId}
                  onChange={(e) => setScheduleData({ ...scheduleData, courseId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select a course</option>
                  {timetable.courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher *
                </label>
                <select
                  value={scheduleData.teacherId}
                  onChange={(e) => setScheduleData({ ...scheduleData, teacherId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select a teacher</option>
                  {timetable.teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room *
                </label>
                <select
                  value={scheduleData.roomId}
                  onChange={(e) => setScheduleData({ ...scheduleData, roomId: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select a room</option>
                  {timetable.rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <button type="submit" className="btn-primary">
                  Schedule Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSelectedSlot(null);
                    setScheduleData({ courseId: '', teacherId: '', roomId: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(timetable.slots).length}
          </div>
          <div className="text-sm text-gray-600">Scheduled Classes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {timetable.courses.length}
          </div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {timetable.teachers.length}
          </div>
          <div className="text-sm text-gray-600">Total Teachers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {timetable.rooms.length}
          </div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;
