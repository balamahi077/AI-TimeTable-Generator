// Gemini API integration for AI-powered timetable generation

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-Flash:generateContent';

export class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate content with Gemini API');
    }
  }

  async generateTimetableSuggestions(courses, teachers, rooms, constraints) {
    const prompt = `
You are an AI assistant specialized in creating optimal college timetables. 

Given the following data:
- Courses: ${JSON.stringify(courses.map(c => ({ name: c.name, code: c.code, credits: c.credits, department: c.department })))}
- Teachers: ${JSON.stringify(teachers.map(t => ({ name: t.name, department: t.department, specialization: t.specialization })))}
- Rooms: ${JSON.stringify(rooms.map(r => ({ name: r.name, capacity: r.capacity, type: r.type })))}
- Constraints: ${JSON.stringify(constraints.map(c => ({ type: c.type, description: c.description })))}

Please provide:
1. Optimal scheduling suggestions considering teacher availability and room capacity
2. Conflict resolution strategies
3. Recommendations for improving the timetable efficiency
4. Alternative scheduling options

Format your response as a structured JSON with the following structure:
{
  "suggestions": [
    {
      "type": "scheduling",
      "description": "Description of the suggestion",
      "priority": "high|medium|low",
      "implementation": "How to implement this suggestion"
    }
  ],
  "conflict_resolutions": [
    {
      "conflict_type": "teacher_conflict|room_conflict|capacity_conflict",
      "solution": "Proposed solution",
      "impact": "Impact on the timetable"
    }
  ],
  "optimization_tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "alternative_schedules": [
    {
      "name": "Alternative 1",
      "description": "Description of this alternative",
      "pros": ["Advantage 1", "Advantage 2"],
      "cons": ["Disadvantage 1", "Disadvantage 2"]
    }
  ]
}
`;

    try {
      const response = await this.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating timetable suggestions:', error);
      return {
        suggestions: [],
        conflict_resolutions: [],
        optimization_tips: [],
        alternative_schedules: []
      };
    }
  }

  async analyzeConstraints(courses, teachers, rooms) {
    const prompt = `
Analyze the following college timetable data and identify potential constraints and conflicts:

Courses: ${JSON.stringify(courses.map(c => ({ name: c.name, code: c.code, credits: c.credits, department: c.department, prerequisites: c.prerequisites })))}

Teachers: ${JSON.stringify(teachers.map(t => ({ name: t.name, department: t.department, specialization: t.specialization, maxHoursPerWeek: t.maxHoursPerWeek })))}

Rooms: ${JSON.stringify(rooms.map(r => ({ name: r.name, capacity: r.capacity, type: r.type, equipment: r.equipment })))}

Please identify:
1. Potential scheduling conflicts
2. Resource constraints
3. Teacher workload issues
4. Room capacity problems
5. Course prerequisite conflicts

Format as JSON:
{
  "conflicts": [
    {
      "type": "conflict_type",
      "description": "Description of the conflict",
      "severity": "high|medium|low",
      "affected_resources": ["resource1", "resource2"]
    }
  ],
  "constraints": [
    {
      "type": "constraint_type",
      "description": "Description of the constraint",
      "impact": "Impact on scheduling"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}
`;

    try {
      const response = await this.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing constraints:', error);
      return {
        conflicts: [],
        constraints: [],
        recommendations: []
      };
    }
  }

  async optimizeTimetable(timetable, preferences) {
    const prompt = `
Given the current timetable and optimization preferences, suggest improvements:

Current Timetable: ${JSON.stringify(timetable.slots)}

Preferences: ${JSON.stringify(preferences)}

Please provide optimization suggestions focusing on:
1. Reducing conflicts
2. Improving resource utilization
3. Balancing teacher workload
4. Minimizing gaps in schedules
5. Maximizing student convenience

Format as JSON:
{
  "optimizations": [
    {
      "type": "optimization_type",
      "description": "Description of the optimization",
      "expected_improvement": "Expected improvement percentage",
      "implementation_steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "priority_changes": [
    {
      "from": "current_slot",
      "to": "suggested_slot",
      "reason": "Reason for the change",
      "impact": "Impact on the timetable"
    }
  ]
}
`;

    try {
      const response = await this.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error optimizing timetable:', error);
      return {
        optimizations: [],
        priority_changes: []
      };
    }
  }

  async generateNaturalLanguageQuery(query, timetable) {
    const prompt = `
User Query: "${query}"

Context: This is a college timetable management system with the following data:
- Courses: ${timetable.courses.length} courses
- Teachers: ${timetable.teachers.length} teachers  
- Rooms: ${timetable.rooms.length} rooms
- Scheduled slots: ${Object.keys(timetable.slots).length} slots

Please interpret this query and provide a structured response that can be used to:
1. Search/filter the timetable data
2. Generate reports
3. Answer questions about the schedule

Format as JSON:
{
  "intent": "search|report|question|modify",
  "parameters": {
    "courses": ["course1", "course2"],
    "teachers": ["teacher1", "teacher2"],
    "rooms": ["room1", "room2"],
    "days": ["Monday", "Tuesday"],
    "time_range": "08:00-17:00"
  },
  "response": "Natural language response to the user",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}
`;

    try {
      const response = await this.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error processing natural language query:', error);
      return {
        intent: 'question',
        parameters: {},
        response: 'I apologize, but I could not process your query. Please try rephrasing it.',
        suggestions: []
      };
    }
  }
}

export const geminiService = new GeminiService();
