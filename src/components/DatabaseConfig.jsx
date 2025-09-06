import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Settings, Download, Upload } from 'lucide-react';
import { databaseService } from '../services/databaseService';

const DatabaseConfig = ({ onDatabaseReady }) => {
  const [dbType, setDbType] = useState('sqlite');
  const [connectionString, setConnectionString] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Check if database is already connected
    const status = databaseService.getConnectionStatus();
    if (status.connected) {
      setConnectionStatus(status);
      onDatabaseReady(true);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await databaseService.connect(dbType, connectionString);
      if (success) {
        const status = databaseService.getConnectionStatus();
        setConnectionStatus(status);
        onDatabaseReady(true);
        alert('Database connected successfully!');
      } else {
        alert('Failed to connect to database. Please check your configuration.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Connection error: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await databaseService.disconnect();
    setConnectionStatus(null);
    onDatabaseReady(false);
    alert('Disconnected from database');
  };

  const handleBackup = async () => {
    try {
      const backup = await databaseService.backupDatabase();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timetable-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('Backup created successfully!');
    } catch (error) {
      console.error('Backup error:', error);
      alert('Backup failed: ' + error.message);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await databaseService.restoreDatabase(text);
      if (success) {
        alert('Database restored successfully!');
        window.location.reload(); // Refresh to load restored data
      } else {
        alert('Restore failed. Please check your backup file.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Restore failed: ' + error.message);
    }
  };

  const databaseTypes = [
    {
      id: 'sqlite',
      name: 'SQLite (Local)',
      description: 'Local database file, perfect for single-user applications',
      icon: '🗄️',
      recommended: true
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Powerful relational database for production environments',
      icon: '🐘',
      recommended: false
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      description: 'Document-based database for flexible data structures',
      icon: '🍃',
      recommended: false
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Cloud database with real-time features and API',
      icon: '☁️',
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Configuration</h1>
          <p className="text-gray-600 mt-2">Configure database connection for data persistence</p>
        </div>
        {connectionStatus && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected to {connectionStatus.type}</span>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className="card border-l-4 border-green-500 bg-green-50">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Database Connected</h3>
              <p className="text-green-700">
                Successfully connected to {connectionStatus.type} database
              </p>
              <p className="text-sm text-green-600">
                Connected at: {new Date(connectionStatus.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleBackup}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Backup Database</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="btn-danger flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

      {/* Database Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Database Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {databaseTypes.map((db) => (
            <div
              key={db.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                dbType === db.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setDbType(db.id)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{db.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{db.name}</h4>
                  {db.recommended && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{db.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Configuration</h3>
        
        {dbType === 'sqlite' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">SQLite Configuration</h4>
              <p className="text-sm text-blue-700">
                SQLite will automatically create a local database file. No additional configuration required.
                In browser environments, data will be stored in IndexedDB for persistence.
              </p>
            </div>
          </div>
        )}

        {dbType === 'postgresql' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection String
              </label>
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="input-field"
                placeholder="postgresql://username:password@localhost:5432/timetable"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: postgresql://username:password@host:port/database
              </p>
            </div>
          </div>
        )}

        {dbType === 'mongodb' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MongoDB Connection String
              </label>
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="input-field"
                placeholder="mongodb://localhost:27017/timetable"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: mongodb://host:port/database
              </p>
            </div>
          </div>
        )}

        {dbType === 'supabase' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="input-field"
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase API Key
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Your Supabase API key"
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary flex items-center space-x-2"
          >
            <Database className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Connecting...' : 'Connect to Database'}</span>
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced Options</span>
          </button>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backup & Restore</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleBackup}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Create Backup</span>
                  </button>
                  <label className="btn-secondary w-full flex items-center justify-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Restore from Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Database Management</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (window.confirm('This will clear all data. Are you sure?')) {
                        databaseService.clearAllData();
                        alert('All data cleared successfully');
                      }
                    }}
                    className="btn-danger w-full"
                  >
                    Clear All Data
                  </button>
                  <button
                    onClick={() => {
                      const status = databaseService.getConnectionStatus();
                      alert(`Database Status:\nType: ${status.type}\nConnected: ${status.connected}\nTimestamp: ${status.timestamp}`);
                    }}
                    className="btn-secondary w-full"
                  >
                    Check Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Setup Help</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Recommended Setup</h4>
            <p className="text-sm text-yellow-700">
              For most college timetable applications, SQLite is the recommended choice as it requires no server setup and provides excellent performance for single-user or small-team environments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">SQLite Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• No server installation required</li>
                <li>• Single file database</li>
                <li>• Excellent performance</li>
                <li>• Built-in browser support</li>
                <li>• Easy backup and restore</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Production Options</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PostgreSQL for scalability</li>
                <li>• MongoDB for flexibility</li>
                <li>• Supabase for cloud features</li>
                <li>• Real-time collaboration</li>
                <li>• Advanced security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;
