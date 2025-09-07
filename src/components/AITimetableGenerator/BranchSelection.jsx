import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react';

const BranchSelection = ({ onBranchSelected }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const branches = {
    undergraduate: [
      { name: 'Computer Science and Engineering', code: 'CSE', id: 'cse' },
      { name: 'Electronics and Communication Engineering', code: 'ECE', id: 'ece' },
      { name: 'Civil Engineering', code: 'CE', id: 'ce' },
      { name: 'Mechanical Engineering', code: 'ME', id: 'me' },
      { name: 'Electrical and Electronics Engineering', code: 'EEE', id: 'eee' },
      { name: 'Artificial Intelligence and Machine Learning', code: 'AIML', id: 'aiml' }
    ],
    postgraduate: [
      { name: 'Masters in Business Administration', code: 'MBA', id: 'mba' }
    ]
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  const handleContinue = () => {
    if (selectedBranch) {
      onBranchSelected(selectedBranch);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Branch</h1>
          <p className="text-gray-600">Choose your academic branch to generate timetable</p>
        </div>

        {/* Undergraduate Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Under Graduate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.undergraduate.map((branch) => (
              <div
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedBranch?.id === branch.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{branch.name}</h3>
                <p className="text-sm text-gray-600">({branch.code})</p>
              </div>
            ))}
          </div>
        </div>

        {/* Postgraduate Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Post Graduate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.postgraduate.map((branch) => (
              <div
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedBranch?.id === branch.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{branch.name}</h3>
                <p className="text-sm text-gray-600">({branch.code})</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!selectedBranch}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedBranch
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

export default BranchSelection;
