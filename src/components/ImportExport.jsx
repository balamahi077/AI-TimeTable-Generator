import React, { useState } from 'react';
import { Download, Upload, FileText, Table, Database, AlertCircle } from 'lucide-react';

const ImportExport = ({ onExport, onImport }) => {
  const [importFile, setImportFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = () => {
    if (importFile) {
      onImport(importFile);
      setImportFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleExport = (format) => {
    onExport(format);
  };

  const exportFormats = [
    { id: 'json', label: 'JSON', icon: Database, description: 'Complete data with all relationships' },
    { id: 'csv', label: 'CSV', icon: Table, description: 'Spreadsheet format for courses, teachers, rooms' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Printable timetable report' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import & Export</h1>
          <p className="text-gray-600 mt-2">Manage data import and export operations</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Download className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose the format that best suits your needs for exporting timetable data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <div
                  key={format.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    exportFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setExportFormat(format.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{format.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExport(exportFormat)}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export as {exportFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Import timetable data from external files. Supported formats: JSON, CSV.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              id="file-input"
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Click to select file or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                JSON, CSV files up to 10MB
              </span>
            </label>
          </div>

          {importFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">{importFile.name}</p>
                  <p className="text-xs text-blue-600">
                    {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleImport}
                  className="btn-primary text-sm"
                >
                  Import
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Important Notes</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Always backup your data before importing new files</li>
              <li>• Importing will replace all current data</li>
              <li>• JSON format preserves all relationships and settings</li>
              <li>• CSV format is suitable for bulk data entry</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Export Templates</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download empty templates to prepare your data for import.
              </p>
              <div className="space-y-2">
                <button className="btn-secondary text-sm w-full">
                  Download Course Template
                </button>
                <button className="btn-secondary text-sm w-full">
                  Download Teacher Template
                </button>
                <button className="btn-secondary text-sm w-full">
                  Download Room Template
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Bulk Operations</h4>
              <p className="text-sm text-gray-600 mb-3">
                Perform bulk operations on your timetable data.
              </p>
              <div className="space-y-2">
                <button className="btn-secondary text-sm w-full">
                  Clear All Data
                </button>
                <button className="btn-secondary text-sm w-full">
                  Reset to Sample Data
                </button>
                <button className="btn-secondary text-sm w-full">
                  Validate Data Integrity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Format Help */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Format Help</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">JSON Format</h4>
            <p className="text-sm text-gray-600 mb-2">
              Complete data export including all relationships, constraints, and settings.
            </p>
            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700">
              {`{
  "courses": [...],
  "teachers": [...],
  "rooms": [...],
  "slots": {...},
  "constraints": [...]
}`}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600 mb-2">
              Spreadsheet format for individual data types. Each CSV file contains one data type.
            </p>
            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700">
              {`name,code,credits,department,maxStudents
Data Structures,CS201,3,Computer Science,40
Database Systems,CS301,3,Computer Science,35`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
