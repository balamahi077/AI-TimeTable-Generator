# AI TimeTable Generator

A comprehensive AI-powered timetable management system for colleges, built with React.js and integrated with Google's Gemini AI for intelligent scheduling suggestions.

## Features

### 🎯 Core Functionality
- **Course Management**: Add, edit, and manage courses with prerequisites and capacity constraints
- **Teacher Management**: Manage teacher profiles, availability, and specializations
- **Room Management**: Handle classrooms, labs, and facilities with equipment tracking
- **Visual Timetable**: Interactive timetable view with drag-and-drop scheduling
- **Conflict Detection**: Automatic detection and resolution of scheduling conflicts

### 🤖 AI-Powered Features
- **Intelligent Suggestions**: AI-generated scheduling recommendations using Gemini API
- **Constraint Analysis**: Automatic analysis of scheduling constraints and conflicts
- **Optimization Tips**: AI-powered optimization suggestions for better timetables
- **Predictive Scheduling**: Smart suggestions based on historical data and patterns
- **Natural Language Queries**: Ask questions about your timetable in natural language

### 📊 Advanced Features
- **Real-time Conflict Resolution**: Live conflict detection and resolution suggestions
- **Fitness Scoring**: Timetable quality assessment with fitness metrics
- **Export/Import**: Multiple format support (JSON, CSV, PDF)
- **Responsive Design**: Modern, mobile-friendly interface
- **Data Validation**: Comprehensive data integrity checks

## Technology Stack

- **Frontend**: React.js 18, JavaScript ES6+
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Drag & Drop**: React Beautiful DnD
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timetable-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

### 1. Initial Setup
- Go to **Settings** and configure your Gemini API key
- Set up default time slots and preferences
- Configure teacher maximum hours and conflict thresholds

### 2. Data Management
- **Courses**: Add courses with codes, credits, departments, and prerequisites
- **Teachers**: Add teachers with specializations, availability, and workload limits
- **Rooms**: Add rooms with capacity, type, and equipment information

### 3. Timetable Creation
- Navigate to **Timetable View**
- Click on empty slots to schedule classes
- Select course, teacher, and room for each slot
- View conflicts and fitness scores in real-time

### 4. AI-Powered Optimization
- Go to **AI Suggestions** for intelligent recommendations
- Review conflict analysis and resolution suggestions
- Apply optimization tips for better scheduling
- Export AI analysis reports

### 5. Import/Export
- Export data in JSON, CSV, or PDF formats
- Import data from external files
- Use templates for bulk data entry
- Backup and restore functionality

## API Integration

### Gemini API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your environment variables
4. The application will automatically use the key for AI features

### AI Features
- **Smart Scheduling**: AI analyzes constraints and suggests optimal schedules
- **Conflict Resolution**: Intelligent conflict detection and resolution strategies
- **Optimization**: AI-powered suggestions for improving timetable efficiency
- **Natural Language**: Query your timetable using natural language

## Data Models

### Course
```javascript
{
  id: string,
  name: string,
  code: string,
  credits: number,
  department: string,
  prerequisites: string[],
  maxStudents: number
}
```

### Teacher
```javascript
{
  id: string,
  name: string,
  email: string,
  department: string,
  specialization: string[],
  availability: object,
  maxHoursPerWeek: number
}
```

### Room
```javascript
{
  id: string,
  name: string,
  capacity: number,
  type: string,
  equipment: string[],
  availability: object
}
```

## Customization

### Adding New Room Types
Edit `src/models/index.js` and add new types to `ROOM_TYPES` array.

### Modifying Time Slots
Update `TIME_SLOTS` array in `src/models/index.js` to match your institution's schedule.

### Custom Constraints
Extend the `Constraint` class to add new constraint types for your specific needs.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**AI suggestions not working**
- Check if Gemini API key is correctly set
- Verify API key has proper permissions
- Check browser console for error messages

**Import/Export issues**
- Ensure file format matches expected structure
- Check file size limits (max 10MB)
- Validate JSON syntax for JSON imports

**Performance issues**
- Clear browser cache and localStorage
- Reduce number of scheduled slots for testing
- Check browser developer tools for memory usage

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

## Roadmap

### Upcoming Features
- [ ] Multi-semester support
- [ ] Advanced reporting and analytics
- [ ] Integration with college management systems
- [ ] Mobile app development
- [ ] Advanced AI models integration
- [ ] Real-time collaboration features

---

**Built with ❤️ for educational institutions worldwide**
