import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, FileText, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { databaseService } from '../services/databaseService';
import { Course, Teacher, Room, generateId } from '../models';

const ExcelImporter = ({ onDataImported }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setImportResults(null);
      setValidationErrors([]);
    }
  };

  const validateExcelData = (data) => {
    const errors = [];
    
    // Validate Courses sheet
    if (data.courses) {
      data.courses.forEach((course, index) => {
        if (!course.name) errors.push(`Course ${index + 1}: Name is required`);
        if (!course.code) errors.push(`Course ${index + 1}: Code is required`);
        if (!course.credits || isNaN(course.credits)) errors.push(`Course ${index + 1}: Valid credits required`);
        if (!course.department) errors.push(`Course ${index + 1}: Department is required`);
        if (course.maxStudents && isNaN(course.maxStudents)) errors.push(`Course ${index + 1}: Max students must be a number`);
      });
    }

    // Validate Teachers sheet
    if (data.teachers) {
      data.teachers.forEach((teacher, index) => {
        if (!teacher.name) errors.push(`Teacher ${index + 1}: Name is required`);
        if (!teacher.email) errors.push(`Teacher ${index + 1}: Email is required`);
        if (!teacher.department) errors.push(`Teacher ${index + 1}: Department is required`);
        if (teacher.maxHoursPerWeek && isNaN(teacher.maxHoursPerWeek)) errors.push(`Teacher ${index + 1}: Max hours must be a number`);
      });
    }

    // Validate Rooms sheet
    if (data.rooms) {
      data.rooms.forEach((room, index) => {
        if (!room.name) errors.push(`Room ${index + 1}: Name is required`);
        if (!room.capacity || isNaN(room.capacity)) errors.push(`Room ${index + 1}: Valid capacity required`);
        if (!room.type) errors.push(`Room ${index + 1}: Type is required`);
      });
    }

    return errors;
  };

  const processExcelFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setValidationErrors([]);
    setImportResults(null);

    try {
      const data = await readExcelFile(uploadedFile);
      const errors = validateExcelData(data);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsProcessing(false);
        return;
      }

      const results = await importDataToDatabase(data);
      setImportResults(results);
      
      if (onDataImported) {
        onDataImported();
      }

    } catch (error) {
      console.error('Import error:', error);
      setValidationErrors([`Import failed: ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const result = {
            courses: [],
            teachers: [],
            rooms: []
          };

          // Process each sheet
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (sheetName.toLowerCase().includes('course')) {
              result.courses = jsonData;
            } else if (sheetName.toLowerCase().includes('teacher')) {
              result.teachers = jsonData;
            } else if (sheetName.toLowerCase().includes('room')) {
              result.rooms = jsonData;
            }
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const importDataToDatabase = async (data) => {
    const results = {
      courses: { imported: 0, errors: [] },
      teachers: { imported: 0, errors: [] },
      rooms: { imported: 0, errors: [] }
    };

    // Import Courses
    if (data.courses && data.courses.length > 0) {
      for (const courseData of data.courses) {
        try {
          const course = new Course(
            generateId(),
            courseData.name,
            courseData.code,
            parseInt(courseData.credits),
            courseData.department,
            courseData.prerequisites ? courseData.prerequisites.split(',').map(p => p.trim()) : [],
            parseInt(courseData.maxStudents) || 50
          );
          
          await databaseService.saveCourse(course);
          results.courses.imported++;
        } catch (error) {
          results.courses.errors.push(`Course ${courseData.code}: ${error.message}`);
        }
      }
    }

    // Import Teachers
    if (data.teachers && data.teachers.length > 0) {
      for (const teacherData of data.teachers) {
        try {
          const teacher = new Teacher(
            generateId(),
            teacherData.name,
            teacherData.email,
            teacherData.department,
            teacherData.specialization ? teacherData.specialization.split(',').map(s => s.trim()) : [],
            {}, // availability will be empty initially
            parseInt(teacherData.maxHoursPerWeek) || 40
          );
          
          await databaseService.saveTeacher(teacher);
          results.teachers.imported++;
        } catch (error) {
          results.teachers.errors.push(`Teacher ${teacherData.name}: ${error.message}`);
        }
      }
    }

    // Import Rooms
    if (data.rooms && data.rooms.length > 0) {
      for (const roomData of data.rooms) {
        try {
          const room = new Room(
            generateId(),
            roomData.name,
            parseInt(roomData.capacity),
            roomData.type,
            roomData.equipment ? roomData.equipment.split(',').map(e => e.trim()) : [],
            {} // availability will be empty initially
          );
          
          await databaseService.saveRoom(room);
          results.rooms.imported++;
        } catch (error) {
          results.rooms.errors.push(`Room ${roomData.name}: ${error.message}`);
        }
      }
    }

    return results;
  };

  const downloadTemplate = () => {
    // Create template workbook
    const workbook = XLSX.utils.book_new();

    // Courses template
    const coursesData = [
      {
        name: 'Data Structures',
        code: 'CS201',
        credits: 3,
        department: 'Computer Science',
        prerequisites: 'CS101,MATH101',
        maxStudents: 40
      },
      {
        name: 'Database Systems',
        code: 'CS301',
        credits: 3,
        department: 'Computer Science',
        prerequisites: 'CS201',
        maxStudents: 35
      }
    ];
    const coursesSheet = XLSX.utils.json_to_sheet(coursesData);
    XLSX.utils.book_append_sheet(workbook, coursesSheet, 'Courses');

    // Teachers template
    const teachersData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@college.edu',
        department: 'Computer Science',
        specialization: 'Data Structures,Algorithms',
        maxHoursPerWeek: 40
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@college.edu',
        department: 'Computer Science',
        specialization: 'Database Systems,Software Engineering',
        maxHoursPerWeek: 40
      }
    ];
    const teachersSheet = XLSX.utils.json_to_sheet(teachersData);
    XLSX.utils.book_append_sheet(workbook, teachersSheet, 'Teachers');

    // Rooms template
    const roomsData = [
      {
        name: 'Lecture Hall A',
        capacity: 100,
        type: 'Lecture Hall',
        equipment: 'Projector,Whiteboard'
      },
      {
        name: 'Computer Lab 1',
        capacity: 30,
        type: 'Computer Lab',
        equipment: 'Computers,Projector'
      }
    ];
    const roomsSheet = XLSX.utils.json_to_sheet(roomsData);
    XLSX.utils.book_append_sheet(workbook, roomsSheet, 'Rooms');

    // Download template
    XLSX.writeFile(workbook, 'timetable-template.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Excel Import</h1>
          <p className="text-gray-600 mt-2">Import courses, teachers, and rooms from Excel files</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* Template Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Excel Template Format</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your Excel file should contain three sheets: <strong>Courses</strong>, <strong>Teachers</strong>, and <strong>Rooms</strong>.
            Download the template to see the exact format required.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Courses Sheet</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• name (required)</li>
                <li>• code (required)</li>
                <li>• credits (required)</li>
                <li>• department (required)</li>
                <li>• prerequisites (optional)</li>
                <li>• maxStudents (optional)</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Teachers Sheet</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• name (required)</li>
                <li>• email (required)</li>
                <li>• department (required)</li>
                <li>• specialization (optional)</li>
                <li>• maxHoursPerWeek (optional)</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Rooms Sheet</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• name (required)</li>
                <li>• capacity (required)</li>
                <li>• type (required)</li>
                <li>• equipment (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {uploadedFile ? uploadedFile.name : 'Click to select Excel file'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx and .xls formats
                </p>
              </div>
            </label>
          </div>

          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">{uploadedFile.name}</p>
                  <p className="text-xs text-blue-600">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={processExcelFile}
                  disabled={isProcessing}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Upload className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
                  <span>{isProcessing ? 'Processing...' : 'Import Data'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800">Validation Errors</h3>
          </div>
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                • {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div className="card border-l-4 border-green-500 bg-green-50">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-800">Import Completed</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Courses</h4>
              <div className="text-2xl font-bold text-green-600">
                {importResults.courses.imported}
              </div>
              <div className="text-sm text-gray-600">imported successfully</div>
              {importResults.courses.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {importResults.courses.errors.length} errors
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Teachers</h4>
              <div className="text-2xl font-bold text-green-600">
                {importResults.teachers.imported}
              </div>
              <div className="text-sm text-gray-600">imported successfully</div>
              {importResults.teachers.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {importResults.teachers.errors.length} errors
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Rooms</h4>
              <div className="text-2xl font-bold text-green-600">
                {importResults.rooms.imported}
              </div>
              <div className="text-sm text-gray-600">imported successfully</div>
              {importResults.rooms.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {importResults.rooms.errors.length} errors
                </div>
              )}
            </div>
          </div>

          {/* Show detailed errors if any */}
          {(importResults.courses.errors.length > 0 || 
            importResults.teachers.errors.length > 0 || 
            importResults.rooms.errors.length > 0) && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Import Errors</h4>
              <div className="space-y-2">
                {importResults.courses.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    Courses: {error}
                  </div>
                ))}
                {importResults.teachers.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    Teachers: {error}
                  </div>
                ))}
                {importResults.rooms.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    Rooms: {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Instructions</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Step-by-Step Guide</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Download the Excel template using the button above</li>
              <li>Fill in your data in the three sheets: Courses, Teachers, and Rooms</li>
              <li>Save your Excel file</li>
              <li>Upload the file using the upload area</li>
              <li>Click "Import Data" to process the file</li>
              <li>Review the import results and fix any errors if needed</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Sheet names must contain "course", "teacher", or "room" (case insensitive)</li>
              <li>Required fields must be filled for each record</li>
              <li>Multiple values (like prerequisites) should be comma-separated</li>
              <li>Numeric fields (credits, capacity) must contain valid numbers</li>
              <li>Email addresses must be valid format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImporter;
