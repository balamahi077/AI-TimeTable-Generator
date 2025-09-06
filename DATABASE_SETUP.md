# Database Setup Guide for TimeTable Generator

This guide will help you set up database connectivity for your TimeTable Generator application.

## Database Options

### 1. SQLite (Recommended for Development)
**Best for**: Single-user applications, development, and small deployments

**Setup**:
- No additional setup required
- Automatically creates local database files
- Uses IndexedDB in browser environments
- Uses better-sqlite3 in Node.js environments

**Pros**:
- Zero configuration
- Fast performance
- Single file database
- Built-in browser support

### 2. PostgreSQL (Production)
**Best for**: Multi-user applications, production environments

**Setup**:
1. Install PostgreSQL on your system
2. Create a database named `timetable`
3. Use connection string: `postgresql://username:password@localhost:5432/timetable`

**Installation**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Database Creation**:
```sql
CREATE DATABASE timetable;
CREATE USER timetable_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE timetable TO timetable_user;
```

### 3. MongoDB (Document-based)
**Best for**: Flexible data structures, NoSQL requirements

**Setup**:
1. Install MongoDB
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/timetable`

**Installation**:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

### 4. Supabase (Cloud)
**Best for**: Cloud deployment, real-time features, API access

**Setup**:
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API key
4. Use project URL as connection string

## Quick Start

### Option 1: SQLite (Default)
1. Run the application: `npm run dev`
2. Navigate to Database section in the sidebar
3. Click "Connect to Database" (SQLite is pre-selected)
4. Your data will be automatically saved

### Option 2: PostgreSQL
1. Install PostgreSQL and create database
2. Run: `npm install pg`
3. Update connection string in Database config
4. Connect to database

### Option 3: MongoDB
1. Install MongoDB
2. Run: `npm install mongodb`
3. Start MongoDB service
4. Update connection string in Database config

### Option 4: Supabase
1. Create Supabase project
2. Run: `npm install @supabase/supabase-js`
3. Add project URL and API key
4. Connect to database

## Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_TYPE=sqlite
DATABASE_URL=./timetable.db

# For PostgreSQL
# DATABASE_TYPE=postgresql
# DATABASE_URL=postgresql://username:password@localhost:5432/timetable

# For MongoDB
# DATABASE_TYPE=mongodb
# DATABASE_URL=mongodb://localhost:27017/timetable

# For Supabase
# DATABASE_TYPE=supabase
# DATABASE_URL=https://your-project.supabase.co
# SUPABASE_API_KEY=your-api-key
```

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
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
```

### Teachers Table
```sql
CREATE TABLE teachers (
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
```

### Rooms Table
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  type TEXT NOT NULL,
  equipment TEXT,
  availability TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Timetable Slots Table
```sql
CREATE TABLE timetable_slots (
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
```

## Backup and Restore

### Creating Backups
1. Go to Database section
2. Click "Create Backup"
3. Download JSON file with all data

### Restoring Backups
1. Go to Database section
2. Click "Restore from Backup"
3. Select your backup JSON file
4. Data will be restored automatically

## Troubleshooting

### Common Issues

**Connection Failed**:
- Check if database service is running
- Verify connection string format
- Ensure database exists
- Check firewall settings

**Permission Denied**:
- Verify database user permissions
- Check password correctness
- Ensure user has CREATE/INSERT/UPDATE/DELETE privileges

**Port Already in Use**:
- Change database port in connection string
- Stop conflicting services
- Check for multiple database instances

### Performance Tips

**SQLite**:
- Use WAL mode for better concurrency
- Regular VACUUM for maintenance
- Index frequently queried columns

**PostgreSQL**:
- Tune shared_buffers and work_mem
- Create indexes on foreign keys
- Use connection pooling

**MongoDB**:
- Create compound indexes
- Use projection to limit fields
- Enable sharding for large datasets

## Security Considerations

1. **Never commit database credentials** to version control
2. **Use environment variables** for sensitive data
3. **Enable SSL/TLS** for production databases
4. **Regular backups** and test restore procedures
5. **Monitor database access** and set up alerts
6. **Use strong passwords** and rotate regularly

## Migration Guide

### From localStorage to Database
1. Export data from localStorage
2. Set up database connection
3. Import data using restore function
4. Verify data integrity

### Between Database Types
1. Create backup from current database
2. Set up new database type
3. Restore backup to new database
4. Test all functionality

## Support

For database-related issues:
1. Check the troubleshooting section
2. Review database logs
3. Test connection with database tools
4. Create issue with error details

---

**Note**: SQLite is recommended for most college timetable applications as it provides excellent performance without the complexity of server setup.
