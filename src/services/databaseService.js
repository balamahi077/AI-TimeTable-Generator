// Database service for TimeTable Generator
// Supports multiple database backends: SQLite, PostgreSQL, MongoDB

import { Course, Teacher, Room, Timetable, generateId } from '../models';

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbType = 'sqlite'; // Default to SQLite
    this.isConnected = false;
  }

  async connect(dbType = 'sqlite', connectionString = null) {
    this.dbType = dbType;
    
    try {
      switch (dbType) {
        case 'sqlite':
          await this.connectSQLite();
          break;
        case 'postgresql':
          await this.connectPostgreSQL(connectionString);
          break;
        case 'mongodb':
          await this.connectMongoDB(connectionString);
          break;
        case 'supabase':
          await this.connectSupabase(connectionString);
          break;
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }
      
      this.isConnected = true;
      console.log(`Connected to ${dbType} database successfully`);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async connectSQLite() {
    // For browser environment, we'll use IndexedDB
    // For Node.js environment, we can use better-sqlite3
    if (typeof window !== 'undefined') {
      // Browser environment - use IndexedDB
      this.db = await this.initIndexedDB();
    } else {
      // Node.js environment - use better-sqlite3
      const Database = require('better-sqlite3');
      this.db = new Database('./timetable.db');
      this.initSQLiteTables();
    }
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TimeTableDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Courses table
        if (!db.objectStoreNames.contains('courses')) {
          const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
          courseStore.createIndex('code', 'code', { unique: true });
          courseStore.createIndex('department', 'department', { unique: false });
        }
        
        // Teachers table
        if (!db.objectStoreNames.contains('teachers')) {
          const teacherStore = db.createObjectStore('teachers', { keyPath: 'id' });
          teacherStore.createIndex('email', 'email', { unique: true });
          teacherStore.createIndex('department', 'department', { unique: false });
        }
        
        // Rooms table
        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomStore.createIndex('name', 'name', { unique: true });
          roomStore.createIndex('type', 'type', { unique: false });
        }
        
        // Timetable slots table
        if (!db.objectStoreNames.contains('timetable_slots')) {
          const slotStore = db.createObjectStore('timetable_slots', { keyPath: 'id' });
          slotStore.createIndex('day', 'day', { unique: false });
          slotStore.createIndex('time', 'time', { unique: false });
          slotStore.createIndex('courseId', 'courseId', { unique: false });
          slotStore.createIndex('teacherId', 'teacherId', { unique: false });
          slotStore.createIndex('roomId', 'roomId', { unique: false });
        }
        
        // Constraints table
        if (!db.objectStoreNames.contains('constraints')) {
          db.createObjectStore('constraints', { keyPath: 'id' });
        }
        
        // Settings table
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // AI Generated Timetables table
        if (!db.objectStoreNames.contains('ai_timetables')) {
          const aiTimetableStore = db.createObjectStore('ai_timetables', { keyPath: 'id' });
          aiTimetableStore.createIndex('branchId', 'branchId', { unique: false });
          aiTimetableStore.createIndex('semester', 'semester', { unique: false });
          aiTimetableStore.createIndex('semesterType', 'semesterType', { unique: false });
          aiTimetableStore.createIndex('generatedAt', 'generatedAt', { unique: false });
        }
      };
    });
  }

  initSQLiteTables() {
    // Create tables for SQLite
    const createTables = `
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        credits INTEGER NOT NULL,
        department TEXT NOT NULL,
        prerequisites TEXT,
        maxStudents INTEGER DEFAULT 50,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        specialization TEXT,
        availability TEXT,
        maxHoursPerWeek INTEGER DEFAULT 40,
        currentHours INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        capacity INTEGER NOT NULL,
        type TEXT NOT NULL,
        equipment TEXT,
        availability TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS timetable_slots (
        id TEXT PRIMARY KEY,
        day TEXT NOT NULL,
        time TEXT NOT NULL,
        courseId TEXT,
        teacherId TEXT,
        roomId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses (id),
        FOREIGN KEY (teacherId) REFERENCES teachers (id),
        FOREIGN KEY (roomId) REFERENCES rooms (id)
      );

      CREATE TABLE IF NOT EXISTS constraints (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        violated BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_timetables (
        id TEXT PRIMARY KEY,
        branchId TEXT NOT NULL,
        branchName TEXT NOT NULL,
        semester INTEGER NOT NULL,
        semesterType TEXT NOT NULL,
        academicYear TEXT NOT NULL,
        effectiveDate TEXT NOT NULL,
        institute TEXT NOT NULL,
        department TEXT NOT NULL,
        subjects TEXT NOT NULL,
        teachers TEXT NOT NULL,
        rooms TEXT NOT NULL,
        slots TEXT NOT NULL,
        generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (branchId) REFERENCES branches (id)
      );
    `;

    this.db.exec(createTables);
  }

  // Course operations
  async saveCourse(course) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.saveToIndexedDB('courses', course);
      } else {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO courses 
          (id, name, code, credits, department, prerequisites, maxStudents, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(
          course.id,
          course.name,
          course.code,
          course.credits,
          course.department,
          JSON.stringify(course.prerequisites),
          course.maxStudents
        );
      }
    }
  }

  async getCourses() {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.getAllFromIndexedDB('courses');
      } else {
        const stmt = this.db.prepare('SELECT * FROM courses ORDER BY code');
        const rows = stmt.all();
        return rows.map(row => ({
          ...row,
          prerequisites: JSON.parse(row.prerequisites || '[]')
        }));
      }
    }
  }

  async deleteCourse(courseId) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.deleteFromIndexedDB('courses', courseId);
      } else {
        const stmt = this.db.prepare('DELETE FROM courses WHERE id = ?');
        return stmt.run(courseId);
      }
    }
  }

  // Teacher operations
  async saveTeacher(teacher) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.saveToIndexedDB('teachers', teacher);
      } else {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO teachers 
          (id, name, email, department, specialization, availability, maxHoursPerWeek, currentHours, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(
          teacher.id,
          teacher.name,
          teacher.email,
          teacher.department,
          JSON.stringify(teacher.specialization),
          JSON.stringify(teacher.availability),
          teacher.maxHoursPerWeek,
          teacher.currentHours
        );
      }
    }
  }

  async getTeachers() {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.getAllFromIndexedDB('teachers');
      } else {
        const stmt = this.db.prepare('SELECT * FROM teachers ORDER BY name');
        const rows = stmt.all();
        return rows.map(row => ({
          ...row,
          specialization: JSON.parse(row.specialization || '[]'),
          availability: JSON.parse(row.availability || '{}')
        }));
      }
    }
  }

  async deleteTeacher(teacherId) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.deleteFromIndexedDB('teachers', teacherId);
      } else {
        const stmt = this.db.prepare('DELETE FROM teachers WHERE id = ?');
        return stmt.run(teacherId);
      }
    }
  }

  // Room operations
  async saveRoom(room) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.saveToIndexedDB('rooms', room);
      } else {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO rooms 
          (id, name, capacity, type, equipment, availability, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(
          room.id,
          room.name,
          room.capacity,
          room.type,
          JSON.stringify(room.equipment),
          JSON.stringify(room.availability)
        );
      }
    }
  }

  async getRooms() {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.getAllFromIndexedDB('rooms');
      } else {
        const stmt = this.db.prepare('SELECT * FROM rooms ORDER BY name');
        const rows = stmt.all();
        return rows.map(row => ({
          ...row,
          equipment: JSON.parse(row.equipment || '[]'),
          availability: JSON.parse(row.availability || '{}')
        }));
      }
    }
  }

  async deleteRoom(roomId) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.deleteFromIndexedDB('rooms', roomId);
      } else {
        const stmt = this.db.prepare('DELETE FROM rooms WHERE id = ?');
        return stmt.run(roomId);
      }
    }
  }

  // Timetable operations
  async saveTimetableSlot(slot) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.saveToIndexedDB('timetable_slots', slot);
      } else {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO timetable_slots 
          (id, day, time, courseId, teacherId, roomId)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
          slot.id || generateId(),
          slot.day,
          slot.time,
          slot.courseId,
          slot.teacherId,
          slot.roomId
        );
      }
    }
  }

  async getTimetableSlots() {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.getAllFromIndexedDB('timetable_slots');
      } else {
        const stmt = this.db.prepare('SELECT * FROM timetable_slots ORDER BY day, time');
        return stmt.all();
      }
    }
  }

  async deleteTimetableSlot(slotId) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.deleteFromIndexedDB('timetable_slots', slotId);
      } else {
        const stmt = this.db.prepare('DELETE FROM timetable_slots WHERE id = ?');
        return stmt.run(slotId);
      }
    }
  }

  // AI Generated Timetable operations
  async saveAITimetable(timetable) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.saveToIndexedDB('ai_timetables', timetable);
      } else {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO ai_timetables 
          (id, branchId, branchName, semester, semesterType, academicYear, effectiveDate, 
           institute, department, subjects, teachers, rooms, slots, generatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(
          timetable.id,
          timetable.branchId,
          timetable.branchName,
          timetable.semester,
          timetable.semesterType,
          timetable.academicYear,
          timetable.effectiveDate,
          timetable.institute,
          timetable.department,
          JSON.stringify(timetable.subjects),
          JSON.stringify(timetable.teachers),
          JSON.stringify(timetable.rooms),
          JSON.stringify(timetable.slots)
        );
      }
    }
  }

  async getAITimetables(filters = {}) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        const allTimetables = await this.getAllFromIndexedDB('ai_timetables');
        return this.filterAITimetables(allTimetables, filters);
      } else {
        let query = 'SELECT * FROM ai_timetables';
        const conditions = [];
        const params = [];

        if (filters.branchId) {
          conditions.push('branchId = ?');
          params.push(filters.branchId);
        }
        if (filters.semester) {
          conditions.push('semester = ?');
          params.push(filters.semester);
        }
        if (filters.semesterType) {
          conditions.push('semesterType = ?');
          params.push(filters.semesterType);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY generatedAt DESC';

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => ({
          ...row,
          subjects: JSON.parse(row.subjects),
          teachers: JSON.parse(row.teachers),
          rooms: JSON.parse(row.rooms),
          slots: JSON.parse(row.slots)
        }));
      }
    }
  }

  async getAITimetablesByBranch(branchId) {
    return this.getAITimetables({ branchId });
  }

  async getAITimetablesBySemester(branchId, semester) {
    return this.getAITimetables({ branchId, semester });
  }

  async deleteAITimetable(timetableId) {
    if (this.dbType === 'sqlite') {
      if (typeof window !== 'undefined') {
        return this.deleteFromIndexedDB('ai_timetables', timetableId);
      } else {
        const stmt = this.db.prepare('DELETE FROM ai_timetables WHERE id = ?');
        return stmt.run(timetableId);
      }
    }
  }

  filterAITimetables(timetables, filters) {
    return timetables.filter(timetable => {
      if (filters.branchId && timetable.branchId !== filters.branchId) return false;
      if (filters.semester && timetable.semester !== filters.semester) return false;
      if (filters.semesterType && timetable.semesterType !== filters.semesterType) return false;
      return true;
    });
  }

  // IndexedDB helper methods
  async saveToIndexedDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFromIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Backup and restore
  async backupDatabase() {
    const backup = {
      courses: await this.getCourses(),
      teachers: await this.getTeachers(),
      rooms: await this.getRooms(),
      slots: await this.getTimetableSlots(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(backup, null, 2);
  }

  async restoreDatabase(backupData) {
    try {
      const backup = JSON.parse(backupData);
      
      // Clear existing data
      await this.clearAllData();
      
      // Restore data
      for (const course of backup.courses) {
        await this.saveCourse(course);
      }
      
      for (const teacher of backup.teachers) {
        await this.saveTeacher(teacher);
      }
      
      for (const room of backup.rooms) {
        await this.saveRoom(room);
      }
      
      for (const slot of backup.slots) {
        await this.saveTimetableSlot(slot);
      }
      
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  async clearAllData() {
    const stores = ['courses', 'teachers', 'rooms', 'timetable_slots', 'constraints'];
    
    for (const storeName of stores) {
      if (typeof window !== 'undefined') {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
      } else {
        this.db.prepare(`DELETE FROM ${storeName}`).run();
      }
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      type: this.dbType,
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    if (this.db && typeof window === 'undefined') {
      this.db.close();
    }
    this.isConnected = false;
    this.db = null;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default DatabaseService;
