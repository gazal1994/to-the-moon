const { sequelize } = require('./src/config/database');
const { LessonRequest } = require('./src/models');

async function addReceivedRequests() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    const teacherId = '1a8a6de9-7860-4083-bf33-676afc80fcb6'; // Ahmed Hassan
    
    // Students who will send requests
    const students = [
      {
        id: 'abd06a6a-ebbf-4766-97a0-331919e1de3b',
        name: 'John Smith',
        subject: 'Mathematics',
        message: 'I need help with calculus, especially integration and derivatives.'
      },
      {
        id: '3106622a-47fe-4080-a553-78844e51d12b',
        name: 'Emily Johnson',
        subject: 'Arabic',
        message: 'I want to improve my Arabic reading and writing skills.'
      },
      {
        id: '4ef64795-5b23-40ec-92e5-e91e5c0b7c95',
        name: 'Michael Brown',
        subject: 'Physics',
        message: 'I need tutoring for my physics exam next week.'
      },
      {
        id: '26e8b3b6-7874-47ca-a832-3e9919aa8993',
        name: 'Sarah Davis',
        subject: 'English',
        message: 'Looking for help with essay writing and grammar.'
      },
      {
        id: '6ccea233-80cd-45da-b88c-23a2df3ad77c',
        name: 'David Wilson',
        subject: 'Chemistry',
        message: 'I struggle with organic chemistry concepts.'
      },
      {
        id: '6b20a31d-2710-44df-b04e-1d8f90ab31fd',
        name: 'Lisa Anderson',
        subject: 'Biology',
        message: 'Need assistance with biology lab work and genetics.'
      }
    ];
    
    const requests = [];
    const now = new Date();
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const requestDate = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // Spread over last 12 hours
      const preferredTime = new Date(now.getTime() + ((i + 1) * 24 * 60 * 60 * 1000)); // Future dates
      
      const request = await LessonRequest.create({
        studentId: student.id,
        teacherId: teacherId,
        subject: student.subject,
        preferredMode: i % 2 === 0 ? 'online' : 'in_person',
        preferredTime: preferredTime,
        message: student.message,
        status: 'pending',
        createdAt: requestDate,
        updatedAt: requestDate
      });
      
      requests.push(request);
      console.log(`✅ Created request from ${student.name} for ${student.subject}`);
    }
    
    console.log(`\n✅ Successfully created ${requests.length} received lesson requests for Ahmed Hassan`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addReceivedRequests();
