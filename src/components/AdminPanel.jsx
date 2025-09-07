import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Building2, 
  GraduationCap,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  X
} from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { downloadTimetableAsPDF } from '../utils/timetableDownload';

const AdminPanel = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branchId: '',
    semester: '',
    semesterType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  const branches = [
    { id: 'cse', name: 'Computer Science and Engineering', code: 'CSE' },
    { id: 'ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
    { id: 'ce', name: 'Civil Engineering', code: 'CE' },
    { id: 'me', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
    { id: 'aiml', name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
    { id: 'mba', name: 'Masters in Business Administration', code: 'MBA' }
  ];

  useEffect(() => {
    loadTimetables();
  }, [filters]);

  const loadTimetables = async () => {
    setLoading(true);
    try {
      const timetablesData = await databaseService.getAITimetables(filters);
      setTimetables(timetablesData);
    } catch (error) {
      console.error('Error loading timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      branchId: '',
      semester: '',
      semesterType: ''
    });
    setSearchTerm('');
  };

  const filteredTimetables = timetables.filter(timetable => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        timetable.department.toLowerCase().includes(searchLower) ||
        timetable.branchName.toLowerCase().includes(searchLower) ||
        timetable.institute.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleViewTimetable = (timetable) => {
    setSelectedTimetable(timetable);
    setShowTimetableModal(true);
  };

  const handleDownloadTimetable = (timetable) => {
    downloadTimetableAsPDF(timetable);
  };

  const handleDeleteTimetable = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await databaseService.deleteAITimetable(timetableId);
        await loadTimetables();
      } catch (error) {
        console.error('Error deleting timetable:', error);
      }
    }
  };

  const getBranchInfo = (branchId) => {
    return branches.find(branch => branch.id === branchId) || { name: 'Unknown', code: 'UNK' };
  };

  const getStats = () => {
    const totalTimetables = timetables.length;
    const branchesWithTimetables = new Set(timetables.map(t => t.branchId)).size;
    const semestersWithTimetables = new Set(timetables.map(t => `${t.branchId}-${t.semester}`)).size;
    
    return {
      totalTimetables,
      branchesWithTimetables,
      semestersWithTimetables
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage AI-generated timetables across all branches</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Timetables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTimetables}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Branches Covered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.branchesWithTimetables}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Semester Combinations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.semestersWithTimetables}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search timetables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div className="lg:w-48">
              <select
                value={filters.branchId}
                onChange={(e) => handleFilterChange('branchId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="lg:w-32">
              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Sem {sem}</option>
                ))}
              </select>
            </div>

            {/* Semester Type Filter */}
            <div className="lg:w-32">
              <select
                value={filters.semesterType}
                onChange={(e) => handleFilterChange('semesterType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>

            {/* Refresh */}
            <button
              onClick={loadTimetables}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Timetables Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading timetables...</p>
            </div>
          ) : filteredTimetables.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timetables found</h3>
              <p className="text-gray-600">
                {timetables.length === 0 
                  ? "No AI-generated timetables have been created yet."
                  : "No timetables match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timetable Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch & Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects & Teachers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTimetables.map((timetable) => {
                    const branchInfo = getBranchInfo(timetable.branchId);
                    return (
                      <tr key={timetable.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {timetable.department}
                            </div>
                            <div className="text-sm text-gray-500">
                              {timetable.institute}
                            </div>
                            <div className="text-xs text-gray-400">
                              Academic Year: {timetable.academicYear}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {branchInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Semester {timetable.semester} ({timetable.semesterType})
                            </div>
                            <div className="text-xs text-gray-400">
                              Effective: {timetable.effectiveDate}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span>{timetable.subjects?.length || 0} Subjects</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-green-500" />
                                <span>{timetable.teachers?.length || 0} Teachers</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(timetable.generatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(timetable.generatedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewTimetable(timetable)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Timetable"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadTimetable(timetable)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTimetable(timetable.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Timetable"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Timetable Modal */}
        {showTimetableModal && selectedTimetable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedTimetable.department} - Semester {selectedTimetable.semester}
                  </h2>
                  <button
                    onClick={() => setShowTimetableModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Timetable Display */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left font-medium">Time</th>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                          <th key={day} className="border border-gray-300 p-3 text-center font-medium">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['9:30-10:25', '10:25-11:20', '11:20-11:30', '11:30-12:25', '12:25-1:20', '1:20-2:20', '2:20-3:15', '3:15-4:10', '4:10-5:05'].map(time => (
                        <tr key={time}>
                          <td className="border border-gray-300 p-3 font-medium">{time}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                            const slot = selectedTimetable.slots[`${day}-${time}`];
                            return (
                              <td key={`${day}-${time}`} className="border border-gray-300 p-3 text-center">
                                {slot?.subject ? (
                                  <div className="text-sm">
                                    <div className="font-medium">{slot.subject.code}</div>
                                    <div className="text-gray-600">{slot.subject.name}</div>
                                    <div className="text-xs text-gray-500">{slot.teacher?.name}</div>
                                    <div className="text-xs text-gray-500">{slot.room?.name}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Download Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDownloadTimetable(selectedTimetable)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
