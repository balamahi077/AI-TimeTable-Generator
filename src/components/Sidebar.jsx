import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Settings, 
  Brain, 
  Download, 
  Upload,
  Home,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Terminal,
  Zap,
  Shield
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/teachers', icon: Users, label: 'Teachers' },
    { path: '/rooms', icon: BookOpen, label: 'Rooms' },
    { path: '/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/ai-timetable-generator', icon: Zap, label: 'AI Generator' },
    { path: '/ai-suggestions', icon: Brain, label: 'AI Suggestions' },
    { path: '/admin-panel', icon: Shield, label: 'Admin Panel' },
    { path: '/database', icon: Database, label: 'Database Config' },
    { path: '/database-viewer', icon: Eye, label: 'View Database' },
    { path: '/database-query', icon: Terminal, label: 'SQL Query' },
    { path: '/import-export', icon: Download, label: 'Import/Export' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen && (
          <h2 className="text-lg font-semibold text-gray-800">TimeTable AI</h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {(() => {
          const orderedPaths = ['/admin-panel', '/database', '/database-viewer', '/database-query'];
          const orderedItems = menuItems.filter(item => orderedPaths.includes(item.path));
          const otherItems = menuItems.filter(item => !orderedPaths.includes(item.path));

          return (
            <>
              {otherItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}

              {/* Details block for specific admin/database items */}
              {isOpen && (
                <details className="ml-4 mt-4">
                  <summary className="cursor-pointer select-none px-2 py-1 text-sm font-semibold text-gray-800 hover:text-gray-900">
                    Admin & Database
                  </summary>
                  <ul className="ml-4 mt-2 space-y-2">
                    {orderedItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <li key={`details-${item.path}`}>
                          <Link
                            to={item.path}
                            className={`flex items-center px-2 py-1 text-sm font-medium transition-colors duration-200 ${
                              isActive
                                ? 'text-blue-700'
                                : 'text-gray-700 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </>
          );
        })()}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
