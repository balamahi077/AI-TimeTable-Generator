import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Users, Wifi } from 'lucide-react';
import { Room, generateId } from '../models';

const RoomManagement = ({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const roomTypes = [...new Set((rooms || []).map(room => room?.type).filter(Boolean))];

  const filteredRooms = (rooms || []).filter(room => {
    const roomName = String(room?.name ?? '').toLowerCase();
    const matchesSearch = roomName.includes(searchTerm.toLowerCase());
    const matchesType = !filterType || room?.type === filterType;
    return matchesSearch && matchesType;
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

    const roomData = {
      name: formData.get('name'),
      capacity: parseInt(formData.get('capacity')),
      type: formData.get('type'),
      equipment: formData.get('equipment').split(',').map(e => e.trim()).filter(e => e),
      availability: availability
    };

    if (editingRoom) {
      onUpdateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
    } else {
      onAddRoom(roomData);
    }
    
    setShowAddForm(false);
    e.target.reset();
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowAddForm(true);
  };

  const handleDelete = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      onDeleteRoom(roomId);
    }
  };

  const getRoomTypeColor = (type) => {
    const colors = {
      'Lecture Hall': 'bg-blue-100 text-blue-700',
      'Laboratory': 'bg-green-100 text-green-700',
      'Computer Lab': 'bg-purple-100 text-purple-700',
      'Seminar Room': 'bg-orange-100 text-orange-700',
      'Conference Room': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-2">Manage classrooms, labs, and other facilities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingRoom?.name || ''}
                  required
                  className="input-field"
                  placeholder="e.g., Lecture Hall A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={editingRoom?.capacity || ''}
                  required
                  min="1"
                  className="input-field"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type *
                </label>
                <select
                  name="type"
                  defaultValue={editingRoom?.type || ''}
                  required
                  className="input-field"
                >
                  <option value="">Select room type</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Seminar Room">Seminar Room</option>
                  <option value="Conference Room">Conference Room</option>
                </select>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment & Facilities
              </label>
              <input
                type="text"
                name="equipment"
                defaultValue={editingRoom?.equipment?.join(', ') || ''}
                className="input-field"
                placeholder="e.g., Projector, Whiteboard, Computers, WiFi"
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
                      defaultValue={editingRoom?.availability?.[day]?.join(', ') || ''}
                      className="input-field"
                      placeholder="e.g., 09:00-10:00, 10:00-11:00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button type="submit" className="btn-primary">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRoom(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rooms ({filteredRooms.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Capacity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Equipment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{room.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoomTypeColor(room.type)}`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{room.capacity}</span>
                  </td>
                  <td className="py-3 px-4">
                    {Array.isArray(room.equipment) && room.equipment.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((equipment, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {equipment}
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
                        onClick={() => handleEdit(room)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit room"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rooms found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
