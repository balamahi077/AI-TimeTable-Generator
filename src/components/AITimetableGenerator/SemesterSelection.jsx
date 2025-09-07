import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';

const SemesterSelection = ({ branch, onSemesterSelected, onBack }) => {
  const [semesterType, setSemesterType] = useState(null);
  const [specificSemester, setSpecificSemester] = useState(null);

  const handleSemesterTypeSelect = (type) => {
    setSemesterType(type);
    setSpecificSemester(null); // Reset specific semester when type changes
  };

  const handleSpecificSemesterSelect = (semester) => {
    setSpecificSemester(semester);
  };

  const handleContinue = () => {
    if (semesterType && specificSemester) {
      onSemesterSelected({
        type: semesterType,
        semester: specificSemester,
        branch: branch
      });
    }
  };

  const getSemesterOptions = () => {
    if (semesterType === 'odd') {
      return [1, 3, 5, 7];
    } else if (semesterType === 'even') {
      return [2, 4, 6, 8];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Semester Type</h1>
          <p className="text-gray-600">Department of {branch.name}</p>
        </div>

        {/* Semester Type Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Select Semester Type
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleSemesterTypeSelect('odd')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                semesterType === 'odd'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              Odd Semester
            </button>
            <button
              onClick={() => handleSemesterTypeSelect('even')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                semesterType === 'even'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              Even Semester
            </button>
          </div>
        </div>

        {/* Specific Semester Selection */}
        {semesterType && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Select Specific Semester
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {getSemesterOptions().map((semester) => (
                <button
                  key={semester}
                  onClick={() => handleSpecificSemesterSelect(semester)}
                  className={`py-3 px-6 rounded-lg font-medium transition-colors ${
                    specificSemester === semester
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {semester}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Information */}
        {semesterType && specificSemester && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Selected Configuration:</h3>
            <div className="text-sm text-blue-700">
              <p><strong>Branch:</strong> {branch.name} ({branch.code})</p>
              <p><strong>Semester Type:</strong> {semesterType === 'odd' ? 'Odd' : 'Even'} Semester</p>
              <p><strong>Semester:</strong> {specificSemester}</p>
            </div>
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
            disabled={!semesterType || !specificSemester}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              semesterType && specificSemester
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemesterSelection;
