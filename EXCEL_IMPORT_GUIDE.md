# Excel Import Guide for TimeTable Generator

This guide explains how to use the Excel import feature to bulk import courses, teachers, and rooms data into your TimeTable Generator application.

## Overview

The Excel import feature allows you to:
- Upload Excel files (.xlsx, .xls) with courses, teachers, and rooms data
- Automatically validate and import data into the database
- Get detailed import results with success/error counts
- Download Excel templates for proper formatting

## Excel File Format

Your Excel file must contain **three separate sheets** with specific column names:

### 1. Courses Sheet
**Sheet Name**: Must contain "course" (case insensitive)

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| name | ✅ | Text | Course name | "Data Structures" |
| code | ✅ | Text | Course code | "CS201" |
| credits | ✅ | Number | Credit hours | 3 |
| department | ✅ | Text | Department name | "Computer Science" |
| prerequisites | ❌ | Text | Comma-separated course codes | "CS101,MATH101" |
| maxStudents | ❌ | Number | Maximum students | 40 |

### 2. Teachers Sheet
**Sheet Name**: Must contain "teacher" (case insensitive)

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| name | ✅ | Text | Teacher's full name | "Dr. Sarah Johnson" |
| email | ✅ | Text | Email address | "sarah.johnson@college.edu" |
| department | ✅ | Text | Department name | "Computer Science" |
| specialization | ❌ | Text | Comma-separated subjects | "Data Structures,Algorithms" |
| maxHoursPerWeek | ❌ | Number | Maximum teaching hours | 40 |

### 3. Rooms Sheet
**Sheet Name**: Must contain "room" (case insensitive)

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| name | ✅ | Text | Room name | "Lecture Hall A" |
| capacity | ✅ | Number | Room capacity | 100 |
| type | ✅ | Text | Room type | "Lecture Hall" |
| equipment | ❌ | Text | Comma-separated equipment | "Projector,Whiteboard" |

## Step-by-Step Import Process

### Step 1: Download Template
1. Go to **Import/Export** → **Excel Import** tab
2. Click **"Download Template"** button
3. This downloads `timetable-template.xlsx` with proper formatting

### Step 2: Prepare Your Data
1. Open the downloaded template
2. Fill in your data in the three sheets:
   - **Courses**: Add all your courses
   - **Teachers**: Add all your teachers
   - **Rooms**: Add all your rooms
3. Save the file as `.xlsx` format

### Step 3: Upload and Import
1. In the Excel Import tab, click the upload area
2. Select your prepared Excel file
3. Click **"Import Data"** button
4. Review the import results

## Sample Data Examples

### Courses Sheet Example
```
name                | code  | credits | department        | prerequisites | maxStudents
Data Structures     | CS201 | 3       | Computer Science | CS101,MATH101 | 40
Database Systems    | CS301 | 3       | Computer Science | CS201         | 35
Machine Learning    | CS401 | 4       | Computer Science | CS301         | 30
Calculus I          | MATH101| 4      | Mathematics      |               | 50
Physics I           | PHY101| 3       | Physics          |               | 45
```

### Teachers Sheet Example
```
name                | email                    | department        | specialization                    | maxHoursPerWeek
Dr. Sarah Johnson   | sarah.johnson@college.edu| Computer Science | Data Structures,Algorithms        | 40
Prof. Michael Chen  | michael.chen@college.edu | Computer Science | Database Systems,Software Eng.   | 40
Dr. Emily Davis     | emily.davis@college.edu  | Computer Science | Machine Learning,AI              | 40
Prof. Robert Wilson | robert.wilson@college.edu| Mathematics      | Calculus,Linear Algebra         | 40
Dr. Lisa Brown      | lisa.brown@college.edu  | Physics          | Physics I,Physics II            | 40
```

### Rooms Sheet Example
```
name           | capacity | type         | equipment
Lecture Hall A | 100      | Lecture Hall | Projector,Whiteboard
Computer Lab 1 | 30       | Computer Lab | Computers,Projector
Seminar Room B | 25       | Seminar Room | Whiteboard,TV
Lab 101        | 40       | Laboratory   | Lab Equipment,Computers
Conference Room C| 20     | Conference Room| Projector,Video Conferencing
```

## Validation Rules

### Required Fields
- **Courses**: name, code, credits, department
- **Teachers**: name, email, department
- **Rooms**: name, capacity, type

### Data Validation
- **Credits**: Must be a valid number (1-6)
- **Capacity**: Must be a positive number
- **Email**: Must be valid email format
- **Max Students**: Must be a positive number
- **Max Hours**: Must be a positive number

### Format Requirements
- **Comma-separated values**: Use commas for multiple items (prerequisites, specialization, equipment)
- **Sheet names**: Must contain "course", "teacher", or "room" (case insensitive)
- **File format**: Must be .xlsx or .xls

## Import Results

After importing, you'll see:

### Success Summary
- Number of courses imported
- Number of teachers imported
- Number of rooms imported
- Total processing time

### Error Details
- Specific validation errors
- Row-by-row error messages
- Suggestions for fixing errors

### Example Results
```
✅ Import Completed
Courses: 15 imported successfully
Teachers: 12 imported successfully
Rooms: 8 imported successfully

❌ Import Errors
Course 3: Credits must be a valid number
Teacher 5: Email format is invalid
Room 2: Capacity must be a positive number
```

## Troubleshooting

### Common Issues

**"Sheet not found" Error**
- Ensure sheet names contain "course", "teacher", or "room"
- Check spelling and case sensitivity

**"Required field missing" Error**
- Verify all required columns are present
- Check for empty cells in required fields

**"Invalid data type" Error**
- Ensure numeric fields contain only numbers
- Check for text in numeric columns

**"Email format invalid" Error**
- Verify email addresses are properly formatted
- Check for typos in email addresses

### File Size Limits
- Maximum file size: 10MB
- Recommended: Keep under 5MB for better performance
- Large files may take longer to process

### Performance Tips
- Remove empty rows and columns
- Use consistent data formats
- Avoid special characters in sheet names
- Save as .xlsx format for best compatibility

## Best Practices

### Data Preparation
1. **Use the template**: Always start with the provided template
2. **Consistent formatting**: Keep data formats consistent
3. **Validate manually**: Check data before importing
4. **Backup existing data**: Export current data before importing

### File Organization
1. **Clear sheet names**: Use descriptive sheet names
2. **No empty rows**: Remove empty rows between data
3. **Consistent columns**: Don't add extra columns
4. **Proper data types**: Use correct data types for each column

### Import Process
1. **Test with small data**: Import a few records first
2. **Check results**: Review import results carefully
3. **Fix errors**: Address validation errors before re-importing
4. **Verify data**: Check imported data in the application

## Advanced Features

### Bulk Data Entry
- Import hundreds of records at once
- Automatic ID generation for all records
- Batch processing for better performance

### Data Validation
- Real-time validation during import
- Detailed error reporting
- Suggestions for data fixes

### Template Customization
- Download templates with sample data
- Modify templates for your specific needs
- Reuse templates for future imports

## Support

If you encounter issues:

1. **Check the validation errors** in the import results
2. **Verify your Excel format** matches the template
3. **Test with sample data** first
4. **Contact support** with specific error messages

---

**Note**: The Excel import feature automatically saves all imported data to your connected database, ensuring data persistence and consistency across your TimeTable Generator application.
