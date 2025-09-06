import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Calendar, Users, BookOpen, Settings, Brain, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CourseManagement from './components/CourseManagement';
import TeacherManagement from './components/TeacherManagement';
import RoomManagement from './components/RoomManagement';
import TimetableView from './components/TimetableView';
import AISuggestions from './components/AISuggestions';
import SettingsPage from './components/SettingsPage';
import ImportExport from './components/ImportExport';
import DatabaseConfig from './components/DatabaseConfig';
import DatabaseViewer from './components/DatabaseViewer';
import DatabaseQuery from './components/DatabaseQuery';

// Services and Models
import { Timetable, Course, Teacher, Room, generateId } from './models';
import { geminiService } from './services/geminiService';
import { databaseService } from './services/databaseService';

function App() {
  const [timetable, setTimetable] = useState(new Timetable());
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      // Try to connect to SQLite by default
      const connected = await databaseService.connect('sqlite');
      if (connected) {
        setDatabaseConnected(true);
        await loadDataFromDatabase();
      } else {
        // If database connection fails, initialize with sample data
        initializeSampleData();
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      initializeSampleData();
    }
  };

  const loadDataFromDatabase = async () => {
    try {
      const [courses, teachers, rooms, slots] = await Promise.all([
        databaseService.getCourses(),
        databaseService.getTeachers(),
        databaseService.getRooms(),
        databaseService.getTimetableSlots()
      ]);

      const newTimetable = new Timetable();
      newTimetable.courses = courses;
      newTimetable.teachers = teachers;
      newTimetable.rooms = rooms;
      
      // Convert slots back to timetable format
      slots.forEach(slot => {
        const course = courses.find(c => c.id === slot.courseId);
        const teacher = teachers.find(t => t.id === slot.teacherId);
        const room = rooms.find(r => r.id === slot.roomId);
        
        if (course && teacher && room) {
          newTimetable.addSlot(slot.day, slot.time, course, teacher, room);
        }
      });

      setTimetable(newTimetable);
    } catch (error) {
      console.error('Error loading data from database:', error);
      initializeSampleData();
    }
  };

  const initializeSampleData = () => {
    const newTimetable = new Timetable();
    
    // Sample courses
    const courses = [
      new Course(generateId(), 'Data Structures', 'CS201', 3, 'Computer Science', [], 40),
      new Course(generateId(), 'Database Systems', 'CS301', 3, 'Computer Science', ['CS201'], 35),
      new Course(generateId(), 'Machine Learning', 'CS401', 4, 'Computer Science', ['CS301'], 30),
      new Course(generateId(), 'Calculus I', 'MATH101', 4, 'Mathematics', [], 50),
      new Course(generateId(), 'Physics I', 'PHY101', 3, 'Physics', [], 45),
    ];

    // Sample teachers
    const teachers = [
      new Teacher(generateId(), 'Dr. Sarah Johnson', 'sarah.johnson@college.edu', 'Computer Science', ['Data Structures', 'Algorithms'], { 'Monday': ['09:00-10:00', '10:00-11:00'], 'Wednesday': ['09:00-10:00', '10:00-11:00'] }, 40),
      new Teacher(generateId(), 'Prof. Michael Chen', 'michael.chen@college.edu', 'Computer Science', ['Database Systems', 'Software Engineering'], { 'Tuesday': ['09:00-10:00', '10:00-11:00'], 'Thursday': ['09:00-10:00', '10:00-11:00'] }, 40),
      new Teacher(generateId(), 'Dr. Emily Davis', 'emily.davis@college.edu', 'Computer Science', ['Machine Learning', 'AI'], { 'Monday': ['14:00-15:00', '15:00-16:00'], 'Friday': ['14:00-15:00', '15:00-16:00'] }, 40),
      new Teacher(generateId(), 'Prof. Robert Wilson', 'robert.wilson@college.edu', 'Mathematics', ['Calculus', 'Linear Algebra'], { 'Tuesday': ['08:00-09:00', '09:00-10:00'], 'Thursday': ['08:00-09:00', '09:00-10:00'] }, 40),
      new Teacher(generateId(), 'Dr. Lisa Brown', 'lisa.brown@college.edu', 'Physics', ['Physics I', 'Physics II'], { 'Wednesday': ['10:00-11:00', '11:00-12:00'], 'Friday': ['10:00-11:00', '11:00-12:00'] }, 40),
    ];

    // Sample rooms
    const rooms = [
      new Room(generateId(), 'Lecture Hall A', 100, 'Lecture Hall', ['Projector', 'Whiteboard'], {}),
      new Room(generateId(), 'Computer Lab 1', 30, 'Computer Lab', ['Computers', 'Projector'], {}),
      new Room(generateId(), 'Seminar Room B', 25, 'Seminar Room', ['Whiteboard', 'TV'], {}),
      new Room(generateId(), 'Lab 101', 40, 'Laboratory', ['Lab Equipment', 'Computers'], {}),
      new Room(generateId(), 'Conference Room C', 20, 'Conference Room', ['Projector', 'Video Conferencing'], {}),
    ];

    newTimetable.courses = courses;
    newTimetable.teachers = teachers;
    newTimetable.rooms = rooms;

    setTimetable(newTimetable);
  };

  const addCourse = async (courseData) => {
    const newCourse = new Course(
      generateId(),
      courseData.name,
      courseData.code,
      courseData.credits,
      courseData.department,
      courseData.prerequisites || [],
      courseData.maxStudents || 50
    );
    
    setTimetable(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
    
    // Save to database
    if (databaseConnected) {
      await databaseService.saveCourse(newCourse);
    }
    
    toast.success('Course added successfully!');
  };

  const updateCourse = async (courseId, courseData) => {
    const updatedCourse = { ...courseData, id: courseId };
    
    setTimetable(prev => ({
      ...prev,
      courses: prev.courses.map(course => 
        course.id === courseId ? { ...course, ...courseData } : course
      )
    }));
    
    // Update in database
    if (databaseConnected) {
      await databaseService.saveCourse(updatedCourse);
    }
    
    toast.success('Course updated successfully!');
  };

  const deleteCourse = async (courseId) => {
    setTimetable(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.id !== courseId)
    }));
    
    // Delete from database
    if (databaseConnected) {
      await databaseService.deleteCourse(courseId);
    }
    
    toast.success('Course deleted successfully!');
  };

  const addTeacher = async (teacherData) => {
    const newTeacher = new Teacher(
      generateId(),
      teacherData.name,
      teacherData.email,
      teacherData.department,
      teacherData.specialization || [],
      teacherData.availability || {},
      teacherData.maxHoursPerWeek || 40
    );
    
    setTimetable(prev => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher]
    }));
    
    // Save to database
    if (databaseConnected) {
      await databaseService.saveTeacher(newTeacher);
    }
    
    toast.success('Teacher added successfully!');
  };

  const updateTeacher = async (teacherId, teacherData) => {
    const updatedTeacher = { ...teacherData, id: teacherId };
    
    setTimetable(prev => ({
      ...prev,
      teachers: prev.teachers.map(teacher => 
        teacher.id === teacherId ? { ...teacher, ...teacherData } : teacher
      )
    }));
    
    // Update in database
    if (databaseConnected) {
      await databaseService.saveTeacher(updatedTeacher);
    }
    
    toast.success('Teacher updated successfully!');
  };

  const deleteTeacher = async (teacherId) => {
    setTimetable(prev => ({
      ...prev,
      teachers: prev.teachers.filter(teacher => teacher.id !== teacherId)
    }));
    
    // Delete from database
    if (databaseConnected) {
      await databaseService.deleteTeacher(teacherId);
    }
    
    toast.success('Teacher deleted successfully!');
  };

  const addRoom = async (roomData) => {
    const newRoom = new Room(
      generateId(),
      roomData.name,
      roomData.capacity,
      roomData.type,
      roomData.equipment || [],
      roomData.availability || {}
    );
    
    setTimetable(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
    
    // Save to database
    if (databaseConnected) {
      await databaseService.saveRoom(newRoom);
    }
    
    toast.success('Room added successfully!');
  };

  const updateRoom = async (roomId, roomData) => {
    const updatedRoom = { ...roomData, id: roomId };
    
    setTimetable(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, ...roomData } : room
      )
    }));
    
    // Update in database
    if (databaseConnected) {
      await databaseService.saveRoom(updatedRoom);
    }
    
    toast.success('Room updated successfully!');
  };

  const deleteRoom = async (roomId) => {
    setTimetable(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== roomId)
    }));
    
    // Delete from database
    if (databaseConnected) {
      await databaseService.deleteRoom(roomId);
    }
    
    toast.success('Room deleted successfully!');
  };

  const scheduleClass = async (day, time, courseId, teacherId, roomId) => {
    const course = timetable.courses.find(c => c.id === courseId);
    const teacher = timetable.teachers.find(t => t.id === teacherId);
    const room = timetable.rooms.find(r => r.id === roomId);

    if (!course || !teacher || !room) {
      toast.error('Invalid course, teacher, or room selection');
      return;
    }

    setTimetable(prev => {
      const newTimetable = { ...prev };
      newTimetable.addSlot(day, time, course, teacher, room);
      newTimetable.calculateFitness();
      return newTimetable;
    });

    // Save to database
    if (databaseConnected) {
      const slot = {
        id: generateId(),
        day,
        time,
        courseId,
        teacherId,
        roomId
      };
      await databaseService.saveTimetableSlot(slot);
    }

    toast.success('Class scheduled successfully!');
  };

  const removeClass = async (day, time) => {
    setTimetable(prev => {
      const newTimetable = { ...prev };
      const key = `${day}-${time}`;
      delete newTimetable.slots[key];
      newTimetable.calculateFitness();
      return newTimetable;
    });

    // Remove from database
    if (databaseConnected) {
      const slots = await databaseService.getTimetableSlots();
      const slotToDelete = slots.find(slot => slot.day === day && slot.time === time);
      if (slotToDelete) {
        await databaseService.deleteTimetableSlot(slotToDelete.id);
      }
    }

    toast.success('Class removed successfully!');
  };

  const generateAITimetable = async () => {
    setLoading(true);
    try {
      const suggestions = await geminiService.generateTimetableSuggestions(
        timetable.courses,
        timetable.teachers,
        timetable.rooms,
        timetable.constraints
      );
      
      toast.success('AI suggestions generated successfully!');
      return suggestions;
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
      console.error('AI Generation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTimetable = (format) => {
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(timetable, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'timetable.json';
        link.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Timetable exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to export timetable');
      console.error('Export Error:', error);
    }
  };

  const importTimetable = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = JSON.parse(e.target.result);
        setTimetable(data);
        
        // If database is connected, save imported data
        if (databaseConnected) {
          // Save courses
          for (const course of data.courses || []) {
            await databaseService.saveCourse(course);
          }
          
          // Save teachers
          for (const teacher of data.teachers || []) {
            await databaseService.saveTeacher(teacher);
          }
          
          // Save rooms
          for (const room of data.rooms || []) {
            await databaseService.saveRoom(room);
          }
          
          // Save timetable slots
          for (const [key, slot] of Object.entries(data.slots || {})) {
            const slotData = {
              id: generateId(),
              day: slot.day,
              time: slot.time,
              courseId: slot.course?.id,
              teacherId: slot.teacher?.id,
              roomId: slot.room?.id
            };
            await databaseService.saveTimetableSlot(slotData);
          }
        }
        
        toast.success('Timetable imported successfully!');
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to import timetable');
      console.error('Import Error:', error);
    }
  };

  const handleExcelDataImported = async () => {
    // Reload data from database after Excel import
    if (databaseConnected) {
      await loadDataFromDatabase();
    }
    toast.success('Excel data imported successfully!');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AI TimeTable Generator</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => generateAITimetable()}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>{loading ? 'Generating...' : 'AI Suggestions'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard timetable={timetable} />} />
            <Route 
              path="/courses" 
              element={
                <CourseManagement 
                  courses={timetable.courses}
                  onAddCourse={addCourse}
                  onUpdateCourse={updateCourse}
                  onDeleteCourse={deleteCourse}
                />
              } 
            />
            <Route 
              path="/teachers" 
              element={
                <TeacherManagement 
                  teachers={timetable.teachers}
                  onAddTeacher={addTeacher}
                  onUpdateTeacher={updateTeacher}
                  onDeleteTeacher={deleteTeacher}
                />
              } 
            />
            <Route 
              path="/rooms" 
              element={
                <RoomManagement 
                  rooms={timetable.rooms}
                  onAddRoom={addRoom}
                  onUpdateRoom={updateRoom}
                  onDeleteRoom={deleteRoom}
                />
              } 
            />
            <Route 
              path="/timetable" 
              element={
                <TimetableView 
                  timetable={timetable}
                  onScheduleClass={scheduleClass}
                  onRemoveClass={removeClass}
                />
              } 
            />
            <Route 
              path="/ai-suggestions" 
              element={
                <AISuggestions 
                  timetable={timetable}
                  onGenerateSuggestions={generateAITimetable}
                  loading={loading}
                />
              } 
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route 
              path="/import-export" 
              element={
                <ImportExport 
                  onExport={exportTimetable}
                  onImport={handleExcelDataImported}
                />
              } 
            />
            <Route 
              path="/database" 
              element={
                <DatabaseConfig 
                  onDatabaseReady={setDatabaseConnected}
                />
              } 
            />
            <Route 
              path="/database-viewer" 
              element={<DatabaseViewer />} 
            />
            <Route 
              path="/database-query" 
              element={<DatabaseQuery />} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
