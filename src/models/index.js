// Data models for the TimeTable Generator

export const TIME_SLOTS = [
  '09:30-10:25', '10:25-11:20', '11:30-12:25', '12:25-01:20',
      '02:20-03:15', '03:15-04:10', '04:10-05:05'
];

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const ROOM_TYPES = [
  'Lecture Hall', 'Laboratory', 'Computer Lab', 'Seminar Room', 'Conference Room'
];

// Course model
export class Course {
  constructor(id, name, code, credits, department, prerequisites = [], maxStudents = 50) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.credits = credits;
    this.department = department;
    this.prerequisites = prerequisites;
    this.maxStudents = maxStudents;
    this.sessionsPerWeek = Math.ceil(credits);
    this.duration = 60; // minutes per session
  }
}

// Teacher model
export class Teacher {
  constructor(id, name, email, department, specialization = [], availability = {}, maxHoursPerWeek = 40) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.department = department;
    this.specialization = specialization;
    this.availability = availability; // {day: [timeSlots]}
    this.maxHoursPerWeek = maxHoursPerWeek;
    this.currentHours = 0;
  }
}

// Room model
export class Room {
  constructor(id, name, capacity, type, equipment = [], availability = {}) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.type = type;
    this.equipment = equipment;
    this.availability = availability; // {day: [timeSlots]}
  }
}

// TimeSlot model
export class TimeSlot {
  constructor(day, time, course = null, teacher = null, room = null) {
    this.day = day;
    this.time = time;
    this.course = course;
    this.teacher = teacher;
    this.room = room;
    this.conflicts = [];
  }
}

// Constraint model
export class Constraint {
  constructor(type, description, priority = 'medium') {
    this.type = type; // 'teacher_availability', 'room_capacity', 'course_prerequisite', etc.
    this.description = description;
    this.priority = priority; // 'high', 'medium', 'low'
    this.violated = false;
  }
}

// Timetable model
export class Timetable {
  constructor() {
    this.slots = {};
    this.courses = [];
    this.teachers = [];
    this.rooms = [];
    this.constraints = [];
    this.conflicts = [];
    this.fitness = 0;
  }

  addSlot(day, time, course, teacher, room) {
    const key = `${day}-${time}`;
    this.slots[key] = new TimeSlot(day, time, course, teacher, room);
  }

  getSlot(day, time) {
    const key = `${day}-${time}`;
    return this.slots[key] || null;
  }

  checkConflicts() {
    this.conflicts = [];
    
    // Check teacher conflicts
    const teacherSlots = {};
    Object.values(this.slots).forEach(slot => {
      if (slot.teacher) {
        const key = `${slot.teacher.id}-${slot.day}-${slot.time}`;
        if (teacherSlots[key]) {
          this.conflicts.push({
            type: 'teacher_conflict',
            description: `Teacher ${slot.teacher.name} has overlapping classes`,
            slots: [teacherSlots[key], slot]
          });
        } else {
          teacherSlots[key] = slot;
        }
      }
    });

    // Check room conflicts
    const roomSlots = {};
    Object.values(this.slots).forEach(slot => {
      if (slot.room) {
        const key = `${slot.room.id}-${slot.day}-${slot.time}`;
        if (roomSlots[key]) {
          this.conflicts.push({
            type: 'room_conflict',
            description: `Room ${slot.room.name} has overlapping classes`,
            slots: [roomSlots[key], slot]
          });
        } else {
          roomSlots[key] = slot;
        }
      }
    });

    return this.conflicts;
  }

  calculateFitness() {
    const conflicts = this.checkConflicts();
    const conflictPenalty = conflicts.length * 10;
    const constraintViolations = this.constraints.filter(c => c.violated).length * 5;
    
    this.fitness = Math.max(0, 100 - conflictPenalty - constraintViolations);
    return this.fitness;
  }
}

// Utility functions
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const validateTimetable = (timetable) => {
  const errors = [];
  
  // Check if all courses are scheduled
  const scheduledCourses = new Set();
  Object.values(timetable.slots).forEach(slot => {
    if (slot.course) {
      scheduledCourses.add(slot.course.id);
    }
  });
  
  timetable.courses.forEach(course => {
    if (!scheduledCourses.has(course.id)) {
      errors.push(`Course ${course.name} is not scheduled`);
    }
  });
  
  // Check teacher availability
  Object.values(timetable.slots).forEach(slot => {
    if (slot.teacher && slot.teacher.availability[slot.day]) {
      if (!slot.teacher.availability[slot.day].includes(slot.time)) {
        errors.push(`Teacher ${slot.teacher.name} is not available on ${slot.day} at ${slot.time}`);
      }
    }
  });
  
  return errors;
};

export const exportTimetableToJSON = (timetable) => {
  return JSON.stringify({
    courses: timetable.courses,
    teachers: timetable.teachers,
    rooms: timetable.rooms,
    slots: timetable.slots,
    conflicts: timetable.conflicts,
    fitness: timetable.fitness
  }, null, 2);
};
