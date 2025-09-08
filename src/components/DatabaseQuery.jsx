import React, { useState } from 'react';
import { Database, Play, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { databaseService } from '../services/databaseService';

const DatabaseQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  const predefinedQueries = [
    {
      name: 'All Courses',
      query: 'SELECT * FROM courses ORDER BY code',
      description: 'Get all courses sorted by course code'
    },
    {
      name: 'Teachers by Department',
      query: 'SELECT name, department, specialization FROM teachers ORDER BY department, name',
      description: 'Get teachers grouped by department'
    },
    {
      name: 'Room Capacity Analysis',
      query: 'SELECT type, AVG(capacity) as avg_capacity, COUNT(*) as room_count FROM rooms GROUP BY type',
      description: 'Analyze room capacity by type'
    },
    {
      name: 'Scheduled Classes Count',
      query: 'SELECT day, COUNT(*) as class_count FROM timetable_slots GROUP BY day ORDER BY day',
      description: 'Count classes per day'
    },
    {
      name: 'Teacher Workload',
      query: 'SELECT t.name, t.department, COUNT(ts.id) as scheduled_classes FROM teachers t LEFT JOIN timetable_slots ts ON t.id = ts.teacherId GROUP BY t.id ORDER BY scheduled_classes DESC',
      description: 'Show teacher workload analysis'
    },
    {
      name: 'Room Utilization',
      query: 'SELECT r.name, r.type, COUNT(ts.id) as usage_count FROM rooms r LEFT JOIN timetable_slots ts ON r.id = ts.roomId GROUP BY r.id ORDER BY usage_count DESC',
      description: 'Show room utilization statistics'
    }
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // For SQLite, we'll simulate query execution
      // In a real implementation, you'd execute the actual SQL
      const mockResults = await simulateQueryExecution(query);
      
      setResults({
        columns: mockResults.columns,
        rows: mockResults.rows,
        rowCount: mockResults.rows.length,
        executionTime: mockResults.executionTime
      });

      // Add to history
      setQueryHistory(prev => [
        { query, timestamp: new Date(), success: true },
        ...prev.slice(0, 9) // Keep last 10 queries
      ]);

    } catch (err) {
      setError(err.message);
      setQueryHistory(prev => [
        { query, timestamp: new Date(), success: false, error: err.message },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const simulateQueryExecution = async (sqlQuery) => {
    // Simulate database query execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const queryLower = sqlQuery.toLowerCase();
    
    if (queryLower.includes('select * from courses')) {
      const courses = await databaseService.getCourses();
      return {
        columns: ['id', 'name', 'code', 'credits', 'department', 'maxStudents'],
        rows: courses.map(course => [
          course.id,
          course.name,
          course.code,
          course.credits,
          course.department,
          course.maxStudents
        ]),
        executionTime: '0.023s'
      };
    } else if (queryLower.includes('select * from teachers')) {
      const teachers = await databaseService.getTeachers();
      return {
        columns: ['id', 'name', 'email', 'department', 'maxHoursPerWeek'],
        rows: teachers.map(teacher => [
          teacher.id,
          teacher.name,
          teacher.email,
          teacher.department,
          teacher.maxHoursPerWeek
        ]),
        executionTime: '0.018s'
      };
    } else if (queryLower.includes('select * from rooms')) {
      const rooms = await databaseService.getRooms();
      return {
        columns: ['id', 'name', 'capacity', 'type', 'equipment'],
        rows: rooms.map(room => [
          room.id,
          room.name,
          room.capacity,
          room.type,
          JSON.stringify(room.equipment)
        ]),
        executionTime: '0.015s'
      };
    } else if (queryLower.includes('select * from timetable_slots')) {
      const slots = await databaseService.getTimetableSlots();
      return {
        columns: ['id', 'day', 'time', 'courseId', 'teacherId', 'roomId'],
        rows: slots.map(slot => [
          slot.id,
          slot.day,
          slot.time,
          slot.courseId,
          slot.teacherId,
          slot.roomId
        ]),
        executionTime: '0.020s'
      };
    } else {
      // Generic result for other queries
      return {
        columns: ['result'],
        rows: [['Query executed successfully']],
        executionTime: '0.001s'
      };
    }
  };

  const exportResults = () => {
    if (!results) return;

    const csvContent = [
      results.columns.join(','),
      ...results.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadPredefinedQuery = (predefinedQuery) => {
    setQuery(predefinedQuery.query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Query Interface</h1>
          <p className="text-gray-600 mt-2">Execute SQL queries and analyze your data</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setError(null);
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Predefined Queries */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predefined Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedQueries.map((predefined, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
              onClick={() => loadPredefinedQuery(predefined)}
            >
              <h4 className="font-medium text-gray-900 mb-2">{predefined.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{predefined.description}</p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-hidden">
                {predefined.query}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SQL Query</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your SQL query:
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="SELECT * FROM courses WHERE department = 'Computer Science';"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
              <span>{loading ? 'Executing...' : 'Execute Query'}</span>
            </button>
            {results && (
              <button
                onClick={exportResults}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Results</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Query Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{results.rowCount} rows</span>
              <span>Execution time: {results.executionTime}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {results.columns.map((column, index) => (
                    <th key={index} className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-200 px-4 py-2 text-sm">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Query History</h3>
          <div className="space-y-2">
            {queryHistory.map((historyItem, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {historyItem.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <code className="text-sm text-gray-700 flex-1">
                    {historyItem.query.length > 100 
                      ? historyItem.query.substring(0, 100) + '...'
                      : historyItem.query
                    }
                  </code>
                </div>
                <div className="text-xs text-gray-500">
                  {historyItem.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SQL Help</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Tables</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>courses</code> - Course information</li>
              <li>• <code>teachers</code> - Teacher profiles</li>
              <li>• <code>rooms</code> - Room details</li>
              <li>• <code>timetable_slots</code> - Scheduled classes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Queries</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>SELECT * FROM courses;</code></li>
              <li>• <code>SELECT COUNT(*) FROM teachers;</code></li>
              <li>• <code>SELECT * FROM rooms WHERE capacity &gt; 50;</code></li>
              <li>• <code>SELECT day, COUNT(*) FROM timetable_slots GROUP BY day;</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseQuery;
