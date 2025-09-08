import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Users, CheckCircle, Brain, Plus, X } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

const SubjectSelection = ({ semesterConfig, onSubjectsSelected, onBack }) => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestedSubjects, setAiSuggestedSubjects] = useState([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [customSubject, setCustomSubject] = useState({ name: '', code: '', credits: 3, type: 'Theory' });

  // Predefined subjects for each semester and branch
  const semesterSubjects = {
    cse: {
      1: [
        { name: 'Mathematics I', code: 'MAT101', credits: 4, type: 'Theory' },
        { name: 'Physics I', code: 'PHY101', credits: 3, type: 'Theory' },
        { name: 'Chemistry I', code: 'CHE101', credits: 3, type: 'Theory' },
        { name: 'Programming in C', code: 'CSE101', credits: 3, type: 'Theory' },
        { name: 'Engineering Graphics', code: 'CSE102', credits: 2, type: 'Theory' }
      ],
      2: [
        { name: 'Mathematics II', code: 'MAT102', credits: 4, type: 'Theory' },
        { name: 'Physics II', code: 'PHY102', credits: 3, type: 'Theory' },
        { name: 'Chemistry II', code: 'CHE102', credits: 3, type: 'Theory' },
        { name: 'Data Structures', code: 'CSE201', credits: 3, type: 'Theory' },
        { name: 'Digital Electronics', code: 'CSE202', credits: 3, type: 'Theory' }
      ],
      3: [
        { name: 'Mathematics III', code: 'MAT301', credits: 4, type: 'Theory' },
        { name: 'Computer Organization', code: 'CSE301', credits: 3, type: 'Theory' },
        { name: 'Database Management Systems', code: 'CSE302', credits: 3, type: 'Theory' },
        { name: 'Operating Systems', code: 'CSE303', credits: 3, type: 'Theory' },
        { name: 'Software Engineering', code: 'CSE304', credits: 3, type: 'Theory' }
      ],
      4: [
        { name: 'Mathematics IV', code: 'MAT401', credits: 4, type: 'Theory' },
        { name: 'Computer Networks', code: 'CSE401', credits: 3, type: 'Theory' },
        { name: 'Algorithm Design', code: 'CSE402', credits: 3, type: 'Theory' },
        { name: 'Web Technologies', code: 'CSE403', credits: 3, type: 'Theory' },
        { name: 'Computer Graphics', code: 'CSE404', credits: 3, type: 'Theory' }
      ],
      5: [
        { name: 'Machine Learning', code: 'CSE501', credits: 3, type: 'Theory' },
        { name: 'Artificial Intelligence', code: 'CSE502', credits: 3, type: 'Theory' },
        { name: 'Data Mining', code: 'CSE503', credits: 3, type: 'Theory' },
        { name: 'Mobile Computing', code: 'CSE504', credits: 3, type: 'Theory' },
        { name: 'Information Security', code: 'CSE505', credits: 3, type: 'Theory' }
      ],
      6: [
        { name: 'Deep Learning', code: 'CSE601', credits: 3, type: 'Theory' },
        { name: 'Cloud Computing', code: 'CSE602', credits: 3, type: 'Theory' },
        { name: 'Big Data Analytics', code: 'CSE603', credits: 3, type: 'Theory' },
        { name: 'Internet of Things', code: 'CSE604', credits: 3, type: 'Theory' },
        { name: 'Blockchain Technology', code: 'CSE605', credits: 3, type: 'Theory' }
      ],
      7: [
        { name: 'Parallel Computing', code: 'CSE701', credits: 3, type: 'Theory' },
        { name: 'Cryptography & Network Security', code: 'CSE702', credits: 3, type: 'Theory' },
        { name: 'Big Data Analytics', code: 'CSE703', credits: 3, type: 'Theory' },
        { name: 'Non Traditional Machining', code: 'CSE704', credits: 3, type: 'Theory' },
        { name: 'Internet of Things', code: 'CSE705', credits: 3, type: 'Theory' },
        { name: 'Project Work', code: 'CSE706', credits: 6, type: 'Project' }
      ],
      8: [
        { name: 'Advanced Algorithms', code: 'CSE801', credits: 3, type: 'Theory' },
        { name: 'Distributed Systems', code: 'CSE802', credits: 3, type: 'Theory' },
        { name: 'Advanced Database Systems', code: 'CSE803', credits: 3, type: 'Theory' },
        { name: 'Computer Vision', code: 'CSE804', credits: 3, type: 'Theory' },
        { name: 'Final Year Project', code: 'CSE805', credits: 8, type: 'Project' }
      ]
    }
    // Add other branches as needed
  };

  useEffect(() => {
    const branchSubjects = semesterSubjects[semesterConfig.branch.id] || {};
    const subjects = branchSubjects[semesterConfig.semester] || [];
    setAvailableSubjects(subjects);
    
    // Generate AI suggestions for this branch and semester
    generateAISubjectSuggestions();
  }, [semesterConfig]);

  const generateAISubjectSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `
Based on the branch "${semesterConfig.branch.name}" and semester ${semesterConfig.semester} (${semesterConfig.type} semester), suggest additional relevant subjects that should be included in the curriculum.

Branch: ${semesterConfig.branch.name} (${semesterConfig.branch.code})
Semester: ${semesterConfig.semester}
Semester Type: ${semesterConfig.type}

Please suggest 3-5 additional subjects that are:
1. Relevant to this branch and semester level
2. Industry-relevant and modern
3. Complementary to typical curriculum
4. Include emerging technologies if appropriate

Format as JSON array with: name, code, credits, type (Theory/Lab/Project)
`;

      const suggestions = await geminiService.generateContent(prompt);
      
      // Parse AI suggestions (this would need proper JSON parsing in real implementation)
      const parsedSuggestions = parseAISuggestions(suggestions);
      setAiSuggestedSubjects(parsedSuggestions);
      
    } catch (error) {
      console.error('AI Subject Suggestion Error:', error);
      // Fallback suggestions based on branch
      setAiSuggestedSubjects(getFallbackSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const parseAISuggestions = (aiResponse) => {
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const suggestions = JSON.parse(jsonStr);
        return suggestions.map(subject => ({
          name: subject.name || subject.subject_name,
          code: subject.code || subject.subject_code,
          credits: subject.credits || 3,
          type: subject.type || 'Theory'
        }));
      }
    } catch (error) {
      console.error('Error parsing AI suggestions:', error);
    }
    
    // Fallback to predefined suggestions
    return getFallbackSuggestions();
  };

  const getFallbackSuggestions = () => {
    const branch = semesterConfig.branch.id;
    const semester = semesterConfig.semester;
    
    const fallbackSuggestions = {
      cse: {
        7: [
          { name: 'Cloud Computing', code: 'CSE707', credits: 3, type: 'Theory' },
          { name: 'Machine Learning Lab', code: 'CSE708', credits: 2, type: 'Lab' },
          { name: 'Software Testing', code: 'CSE709', credits: 3, type: 'Theory' }
        ],
        8: [
          { name: 'DevOps Engineering', code: 'CSE808', credits: 3, type: 'Theory' },
          { name: 'Mobile App Development', code: 'CSE809', credits: 3, type: 'Theory' },
          { name: 'Industry Internship', code: 'CSE810', credits: 4, type: 'Project' }
        ]
      }
    };
    
    return fallbackSuggestions[branch]?.[semester] || [];
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.find(s => s.code === subject.code);
      if (isSelected) {
        return prev.filter(s => s.code !== subject.code);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleAddCustomSubject = () => {
    if (customSubject.name && customSubject.code) {
      const newSubject = {
        ...customSubject,
        id: `custom-${Date.now()}`
      };
      setAvailableSubjects(prev => [...prev, newSubject]);
      setCustomSubject({ name: '', code: '', credits: 3, type: 'Theory' });
      setShowAddSubject(false);
    }
  };

  const handleRemoveCustomSubject = (subjectCode) => {
    setAvailableSubjects(prev => prev.filter(s => s.code !== subjectCode));
    setSelectedSubjects(prev => prev.filter(s => s.code !== subjectCode));
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      onSubjectsSelected({
        semesterConfig,
        subjects: selectedSubjects,
        teachers: availableTeachers
      });
    }
  };

  const generateAITimetable = async () => {
    setLoading(true);
    try {
      // Generate AI-powered timetable suggestions
      const prompt = `
Generate an optimal timetable for:
- Branch: ${semesterConfig.branch.name} (${semesterConfig.branch.code})
- Semester: ${semesterConfig.semester} (${semesterConfig.type} semester)
- Selected Subjects: ${selectedSubjects.map(s => s.name).join(', ')}

Please provide:
1. Optimal time slot distribution
2. Teacher-subject assignments based on specializations
3. Room allocation suggestions
4. Lab session scheduling
5. Break time optimization

Format as structured recommendations for timetable generation.
`;

      const suggestions = await geminiService.generateContent(prompt);
      
      // Here you would process the AI suggestions and generate the actual timetable
      console.log('AI Timetable Suggestions:', suggestions);
      
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Subjects</h1>
          <p className="text-gray-600">
            {semesterConfig.branch.name} - Semester {semesterConfig.semester} ({semesterConfig.type} semester)
          </p>
        </div>

        {/* Selected Configuration */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Configuration:</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Branch:</strong> {semesterConfig.branch.name} ({semesterConfig.branch.code})</p>
            <p><strong>Semester:</strong> {semesterConfig.semester} ({semesterConfig.type} semester)</p>
            <p><strong>Selected Subjects:</strong> {selectedSubjects.length}</p>
          </div>
        </div>

        {/* Predefined Subjects */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Predefined Subjects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSubjects.filter(s => !s.id?.startsWith('custom')).map((subject) => {
              const isSelected = selectedSubjects.find(s => s.code === subject.code);
              return (
                <div
                  key={subject.code}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{subject.code}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{subject.credits} Credits</span>
                        <span>{subject.type}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Suggested Subjects */}
        {aiSuggestedSubjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Suggested Subjects
              {loading && <span className="ml-2 text-sm text-blue-600">(Generating...)</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestedSubjects.map((subject) => {
                const isSelected = selectedSubjects.find(s => s.code === subject.code);
                return (
                  <div
                    key={subject.code}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{subject.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{subject.code}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{subject.credits} Credits</span>
                          <span>{subject.type}</span>
                          <span className="text-blue-600 font-medium">AI Suggested</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Subjects */}
        {availableSubjects.filter(s => s.id?.startsWith('custom')).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Custom Added Subjects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSubjects.filter(s => s.id?.startsWith('custom')).map((subject) => {
                const isSelected = selectedSubjects.find(s => s.code === subject.code);
                return (
                  <div
                    key={subject.code}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{subject.name}</h3>
                          <button
                            onClick={() => handleRemoveCustomSubject(subject.code)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{subject.code}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{subject.credits} Credits</span>
                          <span>{subject.type}</span>
                          <span className="text-purple-600 font-medium">Custom</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleSubjectToggle(subject)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Custom Subject */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddSubject(!showAddSubject)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Subject</span>
          </button>

          {showAddSubject && (
            <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Add New Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={customSubject.name}
                    onChange={(e) => setCustomSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={customSubject.code}
                    onChange={(e) => setCustomSubject(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <select
                    value={customSubject.credits}
                    onChange={(e) => setCustomSubject(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 Credit</option>
                    <option value={2}>2 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={4}>4 Credits</option>
                    <option value={6}>6 Credits</option>
                    <option value={8}>8 Credits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={customSubject.type}
                    onChange={(e) => setCustomSubject(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAddSubject(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.name || !customSubject.code}
                  className="btn-primary"
                >
                  Add Subject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Subjects Summary */}
        {selectedSubjects.length > 0 && (
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Selected Subjects ({selectedSubjects.length}):</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <span
                  key={subject.code}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {subject.name} ({subject.code})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Generation Button */}
        {selectedSubjects.length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={generateAITimetable}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Brain className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
              <span>{loading ? 'Generating AI Suggestions...' : 'Generate AI Timetable'}</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleContinue}
            disabled={selectedSubjects.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedSubjects.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Generate Timetable</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
