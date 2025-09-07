import jsPDF from 'jspdf';

export const downloadTimetableAsPDF = (timetable) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Set up the document
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  
  // Header
  doc.text(timetable.institute, 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Department: ${timetable.department}`, 20, 30);
  doc.text(`Semester: ${timetable.semester} (${timetable.semesterType} Semester)`, 20, 35);
  doc.text(`Academic Year: ${timetable.academicYear}`, 20, 40);
  doc.text(`Effective Date: ${timetable.effectiveDate}`, 20, 45);
  
  // Timetable grid
  const startX = 20;
  const startY = 55;
  const cellWidth = 35;
  const cellHeight = 15;
  
  // Days header
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['9:30-10:25', '10:25-11:20', '11:20-11:30', '11:30-12:25', '12:25-1:20', '1:20-2:20', '2:20-3:15', '3:15-4:10', '4:10-5:05'];
  
  // Draw table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Time column header
  doc.text('Time/Day', startX + 5, startY+5);
  
  // Day headers
  days.forEach((day, index) => {
    const x = startX + (index + 1) * cellWidth+5;
    doc.text(day, x, startY+5);
  });
  
  // Draw timetable grid
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  timeSlots.forEach((time, timeIndex) => {
    const y = startY + (timeIndex + 1) * cellHeight;
    
    // Time slot
    doc.text(time, startX, y + 5);
    
    // Day slots
    days.forEach((day, dayIndex) => {
      const x = startX + (dayIndex + 1) * cellWidth;
      const slot = timetable.slots[`${day}-${time}`];
      
      if (slot && slot.subject) {
        doc.text(slot.subject.code, x, y + 3);
        doc.text(slot.subject.name.substring(0, 15), x, y + 7);
        doc.text(slot.teacher?.name?.substring(0, 15) || '', x, y + 11);
      } else if (time === '11:20-11:30' || time === '1:20-2:20') {
        doc.text('Break', x, y + 5);
      }
    });
  });
  
  // Draw borders
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  // Vertical lines
  for (let i = 0; i <= days.length + 1; i++) {
    const x = startX + i * cellWidth;
    doc.line(x, startY, x, startY + (timeSlots.length + 1) * cellHeight);
  }
  
  // Horizontal lines
  for (let i = 0; i <= timeSlots.length + 1; i++) {
    const y = startY + i * cellHeight;
    doc.line(startX, y, startX + (days.length + 1) * cellWidth, y);
  }
  
  // Subject information
  const subjectStartY = startY + (timeSlots.length + 1) * cellHeight + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject Information:', 20, subjectStartY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  timetable.subjects.forEach((subject, index) => {
    const y = subjectStartY + 10 + (index * 8);
    doc.text(`${subject.code}: ${subject.name} (${subject.credits} Credits)`, 20, y);
  });
  
  // Teacher information
  const teacherStartY = subjectStartY + timetable.subjects.length * 8 + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Information:', 20, teacherStartY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  timetable.teachers.forEach((teacher, index) => {
    const y = teacherStartY + 10 + (index * 8);
    doc.text(`${teacher.name} - ${teacher.department}`, 20, y);
  });
  
  // Room information
  const roomStartY = teacherStartY + timetable.teachers.length * 8 + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Room Information:', 20, roomStartY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  timetable.rooms.forEach((room, index) => {
    const y = roomStartY + 10 + (index * 8);
    doc.text(`${room.name} - ${room.type} (${room.capacity} seats)`, 20, y);
  });
  
  // Footer
  const footerY = doc.internal.pageSize.height - 0;
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerY);
  doc.text('AI TimeTable Generator', doc.internal.pageSize.width - 60, footerY);
  
  // Save the PDF
  const fileName = `timetable-${timetable.department.replace(/\s+/g, '-')}-sem${timetable.semester}.pdf`;
  doc.save(fileName);
};

export const downloadTimetableAsExcel = (timetable) => {
  // This would use the xlsx library to create an Excel file
  // Implementation would be similar to the PDF but in Excel format
  console.log('Excel download functionality would be implemented here');
};
