import React, { useState, useEffect } from 'react';
import { Database, Eye, Search, Filter, RefreshCw, Download, Trash2, Edit } from 'lucide-react';
import { databaseService } from '../services/databaseService';

const DatabaseViewer = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    checkConnectionStatus();
    loadAllData();
  }, []);

  const checkConnectionStatus = () => {
    const status = databaseService.getConnectionStatus();
    setConnectionStatus(status);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [courses, teachers, rooms, slots] = await Promise.all([
        databaseService.getCourses(),
        databaseService.getTeachers(),
        databaseService.getRooms(),
        databaseService.getTimetableSlots()
      ]);

      setData({
        courses: courses || [],
        teachers: teachers || [],
        rooms: rooms || [],
        slots: slots || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setData({ courses: [], teachers: [], rooms: [], slots: [] });
    } finally {
      setLoading(false);
    }
  };

  const exportTableData = (tableName) => {
    const tableData = data[tableName] || [];
    const jsonStr = JSON.stringify(tableData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTableData = async (tableName) => {
    if (window.confirm(`Are you sure you want to clear all ${tableName}? This action cannot be undone.`)) {
      try {
        // Clear data from database
        if (tableName === 'courses') {
          const courses = data.courses || [];
          for (const course of courses) {
            await databaseService.deleteCourse(course.id);
          }
        } else if (tableName === 'teachers') {
          const teachers = data.teachers || [];
          for (const teacher of teachers) {
            await databaseService.deleteTeacher(teacher.id);
          }
        } else if (tableName === 'rooms') {
          const rooms = data.rooms || [];
          for (const room of rooms) {
            await databaseService.deleteRoom(room.id);
          }
        } else if (tableName === 'slots') {
          const slots = data.slots || [];
          for (const slot of slots) {
            await databaseService.deleteTimetableSlot(slot.id);
          }
        }
        
        // Reload data
        await loadAllData();
        alert(`${tableName} cleared successfully!`);
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data');
      }
    }
  };

  const getFilteredData = (tableName) => {
    const tableData = data[tableName] || [];
    if (!searchTerm) return tableData;
    
    return tableData.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const tabs = [
    { id: 'courses', label: 'Courses', count: data.courses?.length || 0 },
    { id: 'teachers', label: 'Teachers', count: data.teachers?.length || 0 },
    { id: 'rooms', label: 'Rooms', count: data.rooms?.length || 0 },
    { id: 'slots', label: 'Timetable Slots', count: data.slots?.length || 0 }
  ];

  const renderTable = (tableName) => {
    const filteredData = getFilteredData(tableName);
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No data matches your search' : 'No data available'}
        </div>
      );
    }

    const columns = Object.keys(filteredData[0] || {});
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {columns.map(column => (
                <th key={column} className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                  {column}
                </th>
              ))}
              <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map(column => (
                  <td key={column} className="border border-gray-200 px-4 py-2 text-sm">
                    {typeof item[column] === 'object' 
                      ? JSON.stringify(item[column])
                      : String(item[column] || '-')
                    }
                  </td>
                ))}
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const jsonStr = JSON.stringify(item, null, 2);
                        navigator.clipboard.writeText(jsonStr);
                        alert('Data copied to clipboard!');
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Copy data"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Viewer</h1>
          <p className="text-gray-600 mt-2">View and manage your database content</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className={`card border-l-4 ${
          connectionStatus.connected ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
        }`}>
          <div className="flex items-center space-x-3">
            <Database className={`w-6 h-6 ${
              connectionStatus.connected ? 'text-green-500' : 'text-red-500'
            }`} />
            <div>
              <h3 className={`text-lg font-semibold ${
                connectionStatus.connected ? 'text-green-800' : 'text-red-800'
              }`}>
                {connectionStatus.connected ? 'Database Connected' : 'Database Disconnected'}
              </h3>
              <p className={`${
                connectionStatus.connected ? 'text-green-700' : 'text-red-700'
              }`}>
                {connectionStatus.connected 
                  ? `Connected to ${connectionStatus.type} database`
                  : 'No database connection available'
                }
              </p>
              <p className={`text-sm ${
                connectionStatus.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                Last checked: {new Date(connectionStatus.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {getFilteredData(activeTab).length} of {data[activeTab]?.length || 0} records
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {/* Table Actions */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label} Data
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportTableData(activeTab)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => clearTableData(activeTab)}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            renderTable(activeTab)
          )}
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.courses?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.teachers?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Teachers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.rooms?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Rooms</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {data.slots?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Scheduled Slots</div>
        </div>
      </div>

      {/* Raw Data Export */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export All Data</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Export complete database backup including all tables and relationships.
          </p>
          <button
            onClick={async () => {
              try {
                const backup = await databaseService.backupDatabase();
                const blob = new Blob([backup], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `complete-database-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                alert('Complete database backup exported successfully!');
              } catch (error) {
                console.error('Export error:', error);
                alert('Export failed: ' + error.message);
              }
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
