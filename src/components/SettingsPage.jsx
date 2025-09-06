import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Key, Database } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    geminiApiKey: localStorage.getItem('geminiApiKey') || '',
    defaultTimeSlots: [
      '09:30-10:25', '10:25-11:20', '11:30-12:25', '12:25-01:20',
      '02:20-03:15', '03:15-04:10', '04:10-05:05'
    ],
    maxHoursPerWeek: 40,
    conflictThreshold: 0.8,
    autoSave: true,
    notifications: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('geminiApiKey', settings.geminiApiKey);
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Update environment variable
      if (settings.geminiApiKey) {
        import.meta.env.VITE_GEMINI_API_KEY = settings.geminiApiKey;
      }
      
      setTimeout(() => {
        setIsSaving(false);
        alert('Settings saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
      alert('Error saving settings');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        geminiApiKey: '',
        defaultTimeSlots: [
          '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
          '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
          '16:00-17:00', '17:00-18:00'
        ],
        maxHoursPerWeek: 40,
        conflictThreshold: 0.8,
        autoSave: true,
        notifications: true
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure application preferences and API settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* API Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={settings.geminiApiKey}
              onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
              className="input-field"
              placeholder="Enter your Gemini API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from Google AI Studio. This is required for AI-powered suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Hours Per Week (Teachers)
              </label>
              <input
                type="number"
                value={settings.maxHoursPerWeek}
                onChange={(e) => setSettings({ ...settings, maxHoursPerWeek: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conflict Threshold
              </label>
              <input
                type="number"
                value={settings.conflictThreshold}
                onChange={(e) => setSettings({ ...settings, conflictThreshold: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto-save changes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable notifications</span>
            </label>
          </div>
        </div>
      </div>

      {/* Time Slots Configuration */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Time Slots Configuration</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure the default time slots for your institution. These will be used when creating new timetables.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {settings.defaultTimeSlots.map((slot, index) => (
              <input
                key={index}
                type="text"
                value={slot}
                onChange={(e) => {
                  const newSlots = [...settings.defaultTimeSlots];
                  newSlots[index] = e.target.value;
                  setSettings({ ...settings, defaultTimeSlots: newSlots });
                }}
                className="input-field text-sm"
                placeholder="HH:MM-HH:MM"
              />
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const newSlots = [...settings.defaultTimeSlots, ''];
                setSettings({ ...settings, defaultTimeSlots: newSlots });
              }}
              className="btn-secondary text-sm"
            >
              Add Slot
            </button>
            <button
              onClick={() => {
                if (settings.defaultTimeSlots.length > 1) {
                  const newSlots = settings.defaultTimeSlots.slice(0, -1);
                  setSettings({ ...settings, defaultTimeSlots: newSlots });
                }
              }}
              className="btn-danger text-sm"
            >
              Remove Last
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Powered by:</strong> Gemini AI, React.js, Tailwind CSS</p>
          <p><strong>Features:</strong> AI-powered timetable generation, conflict resolution, optimization suggestions</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
