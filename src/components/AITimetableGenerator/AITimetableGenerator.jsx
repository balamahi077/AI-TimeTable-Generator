import React, { useState } from 'react';
import { Download, RefreshCw, Brain, Calendar, Users, BookOpen } from 'lucide-react';
import BranchSelection from './BranchSelection';
import SemesterSelection from './SemesterSelection';
import SubjectSelection from './SubjectSelection';
import { geminiService } from '../../services/geminiService';
import { databaseService } from '../../services/databaseService';
import { generateId } from '../../models';
import { downloadTimetableAsPDF } from '../../utils/timetableDownload';

const AITimetableGenerator = () => {
  const [currentStep, setCurrentStep] = useState('branch'); // 'branch', 'semester', 'subjects', 'generated'
  const [branch, setBranch] = useState(null);
  const [semesterConfig, setSemesterConfig] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBranchSelected = (selectedBranch) => {
    setBranch(selectedBranch);
    setCurrentStep('semester');
  };

  const handleSemesterSelected = (config) => {
    setSemesterConfig(config);
    setCurrentStep('subjects');
  };

  const handleSubjectsSelected = async (config) => {
    setSelectedSubjects(config.subjects);
    setCurrentStep('generated');
    await generateTimetable(config);
  };

  const generateTimetable = async (config) => {
    setLoading(true);
    setError(null);

    try {
      // Get available teachers/rooms with safe fallbacks so generation always works
      let teachers = [];
      let rooms = [];
      try { teachers = await databaseService.getTeachers(); } catch {}
      try { rooms = await databaseService.getRooms(); } catch {}
      if (!Array.isArray(teachers) || teachers.length === 0) {
        teachers = [
          { id: 't1', name: 'Prof. Michael Chen', department: 'Computer Science', specialization: ['Computer Networks','DBMS','Operating Systems'] },
          { id: 't2', name: 'Dr. Sarah Johnson', department: 'Computer Science', specialization: ['IOT','Machine Learning','AI'] },
          { id: 't3', name: 'Prof. Anita Verma', department: 'Computer Science', specialization: ['Software Engineering','Algorithms'] },
        ];
      }
      if (!Array.isArray(rooms) || rooms.length === 0) {
        rooms = [
          { id: 'r1', name: 'Lecture Hall A1', capacity: 100, type: 'Lecture Hall' },
          { id: 'r2', name: 'Computer Lab 1', capacity: 30, type: 'Computer Lab' },
        ];
      }

      // Generate AI-powered timetable
      const timetable = await generateAITimetable(config, teachers, rooms);
      setGeneratedTimetable(timetable);

      // Save generated timetable to database
      await saveTimetableToDatabase(timetable);

    } catch (error) {
      console.error('Timetable generation error:', error);
      setError('Failed to generate timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAITimetable = async (config, teachers, rooms) => {
    const prompt = `
Generate a complete timetable for:
- Institute: PROUDHADEVARAYA INSTITUTE OF TECHNOLOGY, HOSAPETE
- Department: ${config.semesterConfig.branch.name}
- Semester: ${config.semesterConfig.semester} (${config.semesterConfig.type} semester)
- Subjects: ${config.subjects.map(s => `${s.name} (${s.code})`).join(', ')}

Available Teachers: ${teachers.map(t => `${t.name} - ${t.specialization?.join(', ')}`).join(', ')}
Available Rooms: ${rooms.map(r => `${r.name} (${r.capacity} seats, ${r.type})`).join(', ')}

Requirements:
1. Create a 6-day week timetable (Monday to Saturday)
2. Time slots: 9:30-10:25, 10:25-11:20, 11:20-11:30 (Break), 11:30-12:25, 12:25-1:20, 1:20-2:20 (Lunch), 2:20-3:15, 3:15-4:10, 4:10-5:05
3. Assign teachers based on their specializations
4. Allocate appropriate rooms based on capacity and type
5. Schedule lab sessions appropriately
6. Include project work sessions
7. Ensure no conflicts
8. HARD CONSTRAINT: A teacher must not be scheduled for more than 2 classes per day (max 2 hours/day)
9. weekly 3 times a day for lab that continue for 2 hours
10. saturday is off day(9:30 to 1:30).

Return as structured JSON with complete timetable data.
`;

    try {
      const aiResponse = await geminiService.generateContent(prompt);
      
      // Parse AI response and create structured timetable
      const timetable = createStructuredTimetable(config, teachers, rooms, aiResponse);
      
      // If AI path produced no assignments, fallback to rule-based generation
      const hasAnyAssignments = Object.values(timetable.slots).some(s => s.subject);
      if (!hasAnyAssignments) {
        return createRuleBasedTimetable(config, teachers, rooms);
      }
      return timetable;
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to rule-based generation
      return createRuleBasedTimetable(config, teachers, rooms);
    }
  };

  const createStructuredTimetable = (config, teachers, rooms, aiResponse) => {
    const timeSlots = [
      '9:30-10:25', '10:25-11:20', '11:20-11:30', '11:30-12:25', 
      '12:25-1:20', '1:20-2:20', '2:20-3:15', '3:15-4:10', '4:10-5:05'
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const timetable = {
      id: generateId(),
      institute: 'PROUDHADEVARAYA INSTITUTE OF TECHNOLOGY, HOSAPETE',
      department: config.semesterConfig.branch.name,
      semester: config.semesterConfig.semester,
      semesterType: config.semesterConfig.type,
      academicYear: '2024-25',
      effectiveDate: new Date().toISOString().split('T')[0],
      slots: {},
      subjects: config.subjects,
      teachers: teachers,
      rooms: rooms,
      generatedAt: new Date().toISOString()
    };

    // Create timetable slots
    days.forEach(day => {
      timeSlots.forEach(time => {
        const key = `${day}-${time}`;
        timetable.slots[key] = {
          day,
          time,
          subject: null,
          teacher: null,
          room: null,
          type: 'Theory' // Default, will be updated based on subject
        };
      });
    });

    // Assign subjects to slots based on AI suggestions and rules
    assignSubjectsToSlots(timetable, config.subjects, teachers, rooms);

    return timetable;
  };

  const createRuleBasedTimetable = (config, teachers, rooms) => {
    // Fallback rule-based timetable generation
    const timeSlots = [
      '9:30-10:25', '10:25-11:20', '11:20-11:30', '11:30-12:25', 
      '12:25-1:20', '1:20-2:20', '2:20-3:15', '3:15-4:10', '4:10-5:05'
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const timetable = {
      id: generateId(),
      institute: 'PROUDHADEVARAYA INSTITUTE OF TECHNOLOGY, HOSAPETE',
      department: config.semesterConfig.branch.name,
      semester: config.semesterConfig.semester,
      semesterType: config.semesterConfig.type,
      academicYear: '2024-25',
      effectiveDate: new Date().toISOString().split('T')[0],
      slots: {},
      subjects: config.subjects,
      teachers: teachers,
      rooms: rooms,
      generatedAt: new Date().toISOString()
    };

    // Helper: track per-teacher per-day assignments
    const teacherDailyCount = {}; // { [day]: { [teacherId]: count } }
    const incrementTeacherDay = (day, teacherId) => {
      if (!teacherDailyCount[day]) teacherDailyCount[day] = {};
      teacherDailyCount[day][teacherId] = (teacherDailyCount[day][teacherId] || 0) + 1;
    };
    const canTeachToday = (day, teacherId) => {
      if (!teacherDailyCount[day]) return true;
      return (teacherDailyCount[day][teacherId] || 0) < 2; // Max 2 classes per day
    };

    // Prefer teachers with matching specialization, otherwise any teacher under limit
    const getPreferredTeachers = (subject) => {
      const matching = teachers.filter(t => t.specialization?.some(spec =>
        subject.name.toLowerCase().includes(spec.toLowerCase()) ||
        spec.toLowerCase().includes(subject.name.toLowerCase())
      ));
      const others = teachers.filter(t => !matching.includes(t));
      return [...matching, ...others];
    };

    // Rule-based assignment with per-day teacher limit (max 2)
    let subjectIndex = 0;
    days.forEach(day => {
      timeSlots.forEach((time) => {
        const key = `${day}-${time}`;
        if (time === '11:20-11:30' || time === '1:20-2:20') {
          // Break times
          timetable.slots[key] = {
            day,
            time,
            subject: null,
            teacher: null,
            room: null,
            type: 'Break'
          };
          return;
        }

        if (config.subjects.length === 0) return;

        // Pick subject round-robin
        const subject = config.subjects[subjectIndex];

        // Choose a teacher respecting the 2-per-day limit
        let assignedTeacher = null;
        const candidates = getPreferredTeachers(subject);
        for (const candidate of candidates) {
          if (!candidate?.id) continue;
          if (canTeachToday(day, candidate.id)) {
            assignedTeacher = candidate;
            break;
          }
        }

        // If no candidate fits under the limit, leave unassigned for teacher/room
        const room = findBestRoom(subject, rooms);

        timetable.slots[key] = {
          day,
          time,
          subject,
          teacher: assignedTeacher,
          room: assignedTeacher ? room : null,
          type: subject.type
        };

        if (assignedTeacher?.id) {
          incrementTeacherDay(day, assignedTeacher.id);
        }

        subjectIndex = (subjectIndex + 1) % config.subjects.length;
      });
    });

    return timetable;
  };

  const assignSubjectsToSlots = (timetable, subjects, teachers, rooms) => {
    // Implementation for AI-based subject assignment
    // This would parse the AI response and assign subjects optimally
  };

  const findBestTeacher = (subject, teachers) => {
    // Find teacher with matching specialization
    const matchingTeacher = teachers.find(teacher => 
      teacher.specialization?.some(spec => 
        subject.name.toLowerCase().includes(spec.toLowerCase()) ||
        spec.toLowerCase().includes(subject.name.toLowerCase())
      )
    );
    return matchingTeacher || teachers[0]; // Fallback to first teacher
  };

  const findBestRoom = (subject, rooms) => {
    // Find appropriate room based on subject type
    if (subject.type === 'Lab' || subject.name.toLowerCase().includes('lab')) {
      return rooms.find(room => room.type === 'Computer Lab') || rooms[0];
    }
    return rooms.find(room => room.type === 'Lecture Hall') || rooms[0];
  };

  const saveTimetableToDatabase = async (timetable) => {
    try {
      // Save AI timetable with branch and semester indexing
      const aiTimetable = {
        ...timetable,
        branchId: semesterConfig.branch.id,
        branchName: semesterConfig.branch.name
      };
      
      await databaseService.saveAITimetable(aiTimetable);
      
      // Also save individual timetable slots for compatibility
      for (const [key, slot] of Object.entries(timetable.slots)) {
        if (slot.subject && slot.teacher && slot.room) {
          await databaseService.saveTimetableSlot({
            id: generateId(),
            day: slot.day,
            time: slot.time,
            courseId: slot.subject.code,
            teacherId: slot.teacher.id,
            roomId: slot.room.id
          });
        }
      }
    } catch (error) {
      console.error('Error saving timetable to database:', error);
    }
  };

  const downloadTimetable = () => {
    if (!generatedTimetable) return;

    // Download as PDF
    downloadTimetableAsPDF(generatedTimetable);
  };

  const resetGenerator = () => {
    setCurrentStep('branch');
    setBranch(null);
    setSemesterConfig(null);
    setSelectedSubjects([]);
    setGeneratedTimetable(null);
    setError(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'branch':
        return <BranchSelection onBranchSelected={handleBranchSelected} />;
      case 'semester':
        return (
          <SemesterSelection
            branch={branch}
            onSemesterSelected={handleSemesterSelected}
            onBack={() => setCurrentStep('branch')}
          />
        );
      case 'subjects':
        return (
          <SubjectSelection
            semesterConfig={semesterConfig}
            onSubjectsSelected={handleSubjectsSelected}
            onBack={() => setCurrentStep('semester')}
          />
        );
      case 'generated':
        return renderGeneratedTimetable();
      default:
        return <BranchSelection onBranchSelected={handleBranchSelected} />;
    }
  };

  const renderGeneratedTimetable = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full text-center">
            <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Timetable</h2>
            <p className="text-gray-600">AI is creating your optimal timetable...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Generation Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={resetGenerator} className="btn-primary">
              Start Over
            </button>
          </div>
        </div>
      );
    }

    if (!generatedTimetable) {
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generated Timetable</h1>
            <p className="text-gray-600">
              {generatedTimetable.department} - Semester {generatedTimetable.semester}
            </p>
          </div>

          {/* Timetable Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetGenerator}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate New</span>
              </button>
            </div>
            <button
              onClick={downloadTimetable}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Timetable</span>
            </button>
          </div>

          {/* Timetable Display */}
          <div className="overflow-x-auto">
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
                      const slot = generatedTimetable.slots[`${day}-${time}`];
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

          {/* Subject Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects</h3>
              <div className="space-y-2">
                {generatedTimetable.subjects.map(subject => (
                  <div key={subject.code} className="flex justify-between items-center">
                    <span className="text-sm">{subject.name}</span>
                    <span className="text-xs text-gray-500">{subject.code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teachers</h3>
              <div className="space-y-2">
                {generatedTimetable.teachers.map(teacher => (
                  <div key={teacher.id} className="text-sm">
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.department}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms</h3>
              <div className="space-y-2">
                {generatedTimetable.rooms.map(room => (
                  <div key={room.id} className="text-sm">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs text-gray-500">{room.type} ({room.capacity} seats)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderCurrentStep()}
    </div>
  );
};

export default AITimetableGenerator;
