import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, RefreshCw, Download } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { databaseService } from '../services/databaseService';

const AISuggestions = ({ timetable, onGenerateSuggestions, loading }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [constraintAnalysis, setConstraintAnalysis] = useState(null);
  const [optimizationTips, setOptimizationTips] = useState(null);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    generateSuggestions();
  }, [timetable]);

  const generateSuggestions = async () => {
    try {
      let courses = timetable.courses || timetable.subjects || [];
      let teachers = timetable.teachers || [];
      let rooms = timetable.rooms || [];

      // If incoming timetable lacks data, try loading from DB, with safe fallbacks
      if (!Array.isArray(courses) || courses.length === 0) {
        try { courses = await databaseService.getCourses(); } catch {}
      }
      if (!Array.isArray(teachers) || teachers.length === 0) {
        try { teachers = await databaseService.getTeachers(); } catch {}
      }
      if (!Array.isArray(rooms) || rooms.length === 0) {
        try { rooms = await databaseService.getRooms(); } catch {}
      }
      if (!Array.isArray(courses) || courses.length === 0) {
        courses = [
          { name: 'Cloud Computing', code: 'CSE602', credits: 3, department: 'CSE' },
          { name: 'Machine Learning', code: 'CSE601', credits: 3, department: 'CSE' },
        ];
      }
      if (!Array.isArray(teachers) || teachers.length === 0) {
        teachers = [
          { name: 'Dr. Sarah Johnson', department: 'CSE', specialization: ['AI','ML'] },
          { name: 'Prof. Michael Chen', department: 'CSE', specialization: ['Cloud','Networks'] },
        ];
      }
      if (!Array.isArray(rooms) || rooms.length === 0) {
        rooms = [
          { name: 'Lecture Hall A1', capacity: 100, type: 'Lecture Hall' },
          { name: 'Computer Lab 1', capacity: 30, type: 'Computer Lab' },
        ];
      }
      const constraints = timetable.constraints || [];

      const [suggestionsData, analysisData] = await Promise.all([
        geminiService.generateTimetableSuggestions(
          courses,
          teachers,
          rooms,
          constraints
        ),
        geminiService.analyzeConstraints(
          courses,
          teachers,
          rooms
        )
      ]);

      setSuggestions(suggestionsData);
      setConstraintAnalysis(analysisData);
      setOptimizationTips(analysisData.recommendations);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Show a minimal fallback structure so the UI isn't empty
      setSuggestions({
        suggestions: [
          { type: 'scheduling', description: 'Distribute core subjects across the week', priority: 'medium', implementation: 'Place major subjects on alternate days. Reserve afternoons for labs.' }
        ],
        conflict_resolutions: [],
        optimization_tips: ['Group related subjects', 'Prefer afternoon slots for labs']
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Suggestions</h1>
          <p className="text-gray-600 mt-2">Intelligent recommendations powered by Gemini AI</p>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Generating...' : 'Refresh Suggestions'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
              { id: 'conflicts', label: 'Conflict Analysis', icon: AlertTriangle },
              { id: 'optimization', label: 'Optimization', icon: CheckCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              {suggestions?.suggestions?.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{suggestion.description}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{suggestion.implementation}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Implementation Steps:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {suggestion.implementation.split('.').filter(step => step.trim()).map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{step.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Alternative Schedules */}
              {suggestions?.alternative_schedules?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Schedule Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.alternative_schedules.map((alt, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{alt.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{alt.description}</p>
                        <div className="space-y-2">
                          <div>
                            <h5 className="text-sm font-medium text-green-700">Pros:</h5>
                            <ul className="text-sm text-green-600">
                              {alt.pros.map((pro, proIndex) => (
                                <li key={proIndex}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-red-700">Cons:</h5>
                            <ul className="text-sm text-red-600">
                              {alt.cons.map((con, conIndex) => (
                                <li key={conIndex}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conflict Analysis Tab */}
          {activeTab === 'conflicts' && (
            <div className="space-y-6">
              {/* Current Conflicts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Schedule Conflicts</h3>
                {timetable.checkConflicts().length > 0 ? (
                  <div className="space-y-3">
                    {timetable.checkConflicts().map((conflict, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-800">{conflict.type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-red-700">{conflict.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>No conflicts detected in current schedule!</p>
                  </div>
                )}
              </div>

              {/* AI Conflict Analysis */}
              {constraintAnalysis?.conflicts?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Detected Potential Conflicts</h3>
                  <div className="space-y-3">
                    {constraintAnalysis.conflicts.map((conflict, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{conflict.type.replace('_', ' ').toUpperCase()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(conflict.severity)}`}>
                            {conflict.severity} severity
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{conflict.description}</p>
                        <div className="text-sm text-gray-500">
                          <strong>Affected Resources:</strong> {conflict.affected_resources.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflict Resolutions */}
              {suggestions?.conflict_resolutions?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggested Resolutions</h3>
                  <div className="space-y-3">
                    {suggestions.conflict_resolutions.map((resolution, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium text-blue-800 mb-2">{resolution.conflict_type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-blue-700 mb-2">{resolution.solution}</p>
                        <p className="text-sm text-blue-600"><strong>Impact:</strong> {resolution.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              {/* Optimization Tips */}
              {optimizationTips?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                  <div className="space-y-3">
                    {optimizationTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <p className="text-green-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Optimization Suggestions */}
              {suggestions?.optimization_tips?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization Tips</h3>
                  <div className="space-y-3">
                    {suggestions.optimization_tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                        <p className="text-blue-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {timetable.calculateFitness()}%
                  </div>
                  <div className="text-sm text-gray-600">Current Fitness</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(timetable.slots).length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled Classes</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((Object.keys(timetable.slots).length / (timetable.courses.length * 3)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Suggestions */}
      {suggestions && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export AI Analysis</h3>
              <p className="text-gray-600">Download the complete AI analysis report</p>
            </div>
            <button
              onClick={() => {
                const report = {
                  suggestions: suggestions,
                  constraintAnalysis: constraintAnalysis,
                  timetableFitness: timetable.calculateFitness(),
                  conflicts: timetable.checkConflicts(),
                  generatedAt: new Date().toISOString()
                };
                const dataStr = JSON.stringify(report, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'ai-analysis-report.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
