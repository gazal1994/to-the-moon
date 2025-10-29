const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, TeacherProfile, TeacherAvailability } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(timeStr) {
  if (!timeStr) return '00:00:00';
  
  // Convert to string if not already
  timeStr = String(timeStr).trim();
  
  // If already in 24-hour format (HH:MM or HH:MM:SS)
  if (!timeStr.match(/AM|PM/i)) {
    const parts = timeStr.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = (parts[1] || '00').padStart(2, '0');
    const seconds = (parts[2] || '00').padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Parse 12-hour format
  const match = timeStr.match(/(\d+):?(\d*)?\s*(AM|PM)/i);
  if (!match) return '00:00:00';
  
  let hours = parseInt(match[1]);
  const minutes = (match[2] || '00').padStart(2, '0');
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

// Helper function to convert 24-hour time to 12-hour format for display
function convertTo12Hour(timeStr) {
  if (!timeStr) return '';
  
  const [hours, minutes] = timeStr.split(':');
  let hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  
  return `${hour}:${minutes} ${period}`;
}

// GET /api/teachers/me - Get current teacher profile
router.get('/me', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatarUrl']
      }]
    });
    
    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        error: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: teacherProfile
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/teachers/me - Update teacher profile
router.patch('/me', authenticate, authorize('teacher'), [
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('experience').optional().trim(),
  body('education').optional().trim(),
  body('bio').optional().trim(),
  body('availability').optional().isArray().withMessage('Availability must be an array'),
  body('isVolunteer').optional().isBoolean().withMessage('isVolunteer must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      subjects,
      levels,
      yearsOfExperience,
      certifications,
      hourlyRate,
      isVolunteer,
      maxStudentsPerSession,
      learningMode,
      availability
    } = req.body;

    // Find teacher profile in database
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!teacherProfile) {
      return res.status(404).json({
        success: false,
        error: 'Teacher profile not found'
      });
    }

    // Update teacher profile in database
    const updateData = {};
    if (subjects) updateData.subjects = subjects;
    if (levels) updateData.levels = levels;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (certifications) updateData.certifications = certifications;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (isVolunteer !== undefined) updateData.isVolunteer = isVolunteer;
    if (maxStudentsPerSession !== undefined) updateData.maxStudentsPerSession = maxStudentsPerSession;
    if (learningMode) updateData.learningMode = learningMode;

    await teacherProfile.update(updateData);

    // Handle availability separately in teacher_availability table
    if (availability && Array.isArray(availability)) {
      console.log('📅 Received availability data:', JSON.stringify(availability, null, 2));
      
      // Deactivate all existing slots for this teacher
      await TeacherAvailability.update(
        { isActive: false },
        { where: { teacherId: req.user.id } }
      );

      // Parse and insert new availability slots
      const availabilitySlots = availability.map((slot, index) => {
        try {
          let startTime, endTime, dayOfWeek;

          console.log(`Processing slot ${index}:`, JSON.stringify(slot, null, 2));

          // Handle format from frontend: { dayOfWeek, startTime, endTime }
          if (slot.startTime && slot.endTime && slot.dayOfWeek) {
            startTime = convertTo24Hour(slot.startTime);
            endTime = convertTo24Hour(slot.endTime);
            dayOfWeek = slot.dayOfWeek;
          }
          // Handle old format: { day, time: "9:00 AM - 10:00 AM" }
          else if (slot.time && typeof slot.time === 'string' && slot.time.includes('-')) {
            const [start, end] = slot.time.split('-').map(t => t.trim());
            startTime = convertTo24Hour(start);
            endTime = convertTo24Hour(end);
            dayOfWeek = slot.day || slot.dayOfWeek;
          }
          // Handle simple string format
          else {
            const timeRange = slot.time || slot;
            startTime = convertTo24Hour(timeRange);
            const [hours, minutes] = startTime.split(':');
            endTime = `${String((parseInt(hours) + 1) % 24).padStart(2, '0')}:${minutes}:00`;
            dayOfWeek = slot.day || slot.dayOfWeek || 'Monday';
          }

          console.log(`✓ Parsed slot ${index}:`, { dayOfWeek, startTime, endTime });

          return {
            teacherId: req.user.id,
            dayOfWeek,
            startTime,
            endTime,
            isReserved: false,
            isActive: true
          };
        } catch (error) {
          console.error(`❌ Error parsing slot ${index}:`, error.message);
          console.error('Slot data:', JSON.stringify(slot, null, 2));
          throw error;
        }
      });

      if (availabilitySlots.length > 0) {
        await TeacherAvailability.bulkCreate(availabilitySlots);
        console.log(`✅ Created ${availabilitySlots.length} availability slots for teacher ${req.user.id}`);
      }
    }

    console.log(`✅ Teacher profile updated for user ${req.user.id}:`, updateData);

    res.json({
      success: true,
      data: teacherProfile,
      message: 'Teacher profile updated successfully'
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/search - Search teachers (public endpoint with database)
router.get('/search', async (req, res) => {
  try {
    const {
      query: searchQuery,
      page = 1,
      limit = 20,
      subjects,
      city,
      country,
      isVolunteer,
      minPrice,
      maxPrice,
      rating
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for User model
    const userWhere = {
      role: 'teacher',
      isActive: true
    };

    // Search query filter (search in name, bio)
    if (searchQuery) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { bio: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }

    // Build where clause for TeacherProfile model
    const profileWhere = {};

    if (subjects) {
      const subjectsArray = subjects.split(',');
      profileWhere.subjects = {
        [Op.overlap]: subjectsArray
      };
    }

    if (isVolunteer === 'true') {
      profileWhere.isVolunteer = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      profileWhere.hourlyRate = {};
      if (minPrice !== undefined) {
        profileWhere.hourlyRate[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        profileWhere.hourlyRate[Op.lte] = parseFloat(maxPrice);
      }
    }

    if (rating) {
      profileWhere.ratingAvg = {
        [Op.gte]: parseFloat(rating)
      };
    }

    // Query database
    const { count, rows: teachers } = await User.findAndCountAll({
      where: userWhere,
      include: [
        {
          model: TeacherProfile,
          as: 'teacherProfile',
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          required: true
        }
      ],
      limit: limitNum,
      offset: offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Remove password from response and transform to match frontend format
    const teachersResponse = await Promise.all(teachers.map(async teacher => {
      const userData = teacher.toJSON();
      const profile = userData.teacherProfile || {};
      
      // Fetch availability from teacher_availability table
      const availabilitySlots = await TeacherAvailability.findAll({
        where: {
          teacherId: userData.id,
          isActive: true
        },
        order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
      });

      const availability = availabilitySlots.map(slot => ({
        day: slot.dayOfWeek,
        time: `${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`,
        available: !slot.isReserved
      }));
      
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatarUrl,
        rating: profile.ratingAvg || 0,
        reviewCount: profile.ratingCount || 0,
        experience: profile.yearsOfExperience || 0,
        location: 'Unknown, Unknown', // TODO: Add location to user model
        subjects: profile.subjects || [],
        availableModes: [profile.learningMode || 'online'],
        pricePerHour: parseFloat(profile.hourlyRate) || 0,
        bio: userData.bio || '',
        isVerified: userData.emailVerified || false,
        languages: userData.languages || ['en'],
        role: 'TEACHER',
        // Include teacher profile for additional info
        teacherProfile: {
          subjects: profile.subjects || [],
          levels: profile.levels || [],
          yearsOfExperience: profile.yearsOfExperience || 0,
          certifications: profile.certifications || [],
          hourlyRate: parseFloat(profile.hourlyRate) || 0,
          isVolunteer: profile.isVolunteer || false,
          maxStudentsPerSession: profile.maxStudentsPerSession || 1,
          learningMode: profile.learningMode || 'online',
          availability: availability,
          ratingAvg: profile.ratingAvg || 0,
          ratingCount: profile.ratingCount || 0
        }
      };
    }));

    console.log(`✅ Found ${teachers.length} teachers (total: ${count})`);

    res.json({
      success: true,
      data: {
        teachers: teachersResponse,
        total: count,
        page: pageNum,
        limit: limitNum,
        hasMore: offset + teachers.length < count
      }
    });
  } catch (error) {
    console.error('Search teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers - Get all teachers (public endpoint)
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject,
      city,
      country,
      isVolunteer,
      priceMax
    } = req.query;

    // Get all teachers
    let teachers = Array.from(users.values()).filter(user => user.role === 'teacher');

    // Apply filters
    if (subject) {
      teachers = teachers.filter(t => t.teacherProfile?.subjects.includes(subject));
    }
    if (city) {
      teachers = teachers.filter(t => t.location?.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (country) {
      teachers = teachers.filter(t => t.location?.country?.toLowerCase().includes(country.toLowerCase()));
    }
    if (isVolunteer === 'true') {
      teachers = teachers.filter(t => t.teacherProfile?.isVolunteer);
    }
    if (priceMax) {
      teachers = teachers.filter(t => (t.teacherProfile?.hourlyRate || 0) <= parseFloat(priceMax));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedTeachers = teachers.slice(startIndex, endIndex);
    
    // Remove sensitive data from response
    const teachersResponse = paginatedTeachers.map(({ password, ...teacher }) => ({
      ...teacher,
      // Add mock rating if not present
      teacherProfile: {
        ...teacher.teacherProfile,
        ratingAvg: teacher.teacherProfile?.ratingAvg || Math.floor(Math.random() * 2) + 4, // 4-5 stars
        ratingCount: teacher.teacherProfile?.ratingCount || Math.floor(Math.random() * 50)
      }
    }));

    res.json({
      success: true,
      data: {
        data: teachersResponse,
        total: teachers.length,
        page: pageNum,
        limit: limitNum,
        hasMore: endIndex < teachers.length
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/subjects - Get all unique subjects
router.get('/subjects', async (req, res) => {
  try {
    const teachers = await TeacherProfile.findAll({
      attributes: ['subjects'],
      where: {
        subjects: {
          [Op.ne]: null
        }
      }
    });

    // Extract and flatten all subjects
    const allSubjects = teachers.reduce((acc, teacher) => {
      if (teacher.subjects && Array.isArray(teacher.subjects)) {
        return [...acc, ...teacher.subjects];
      }
      return acc;
    }, []);

    // Get unique subjects
    const uniqueSubjects = [...new Set(allSubjects)].sort();

    res.json({
      success: true,
      data: uniqueSubjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/locations - Get all unique locations
router.get('/locations', async (req, res) => {
  try {
    // For now, return empty arrays for cities and countries since location is not in the model yet
    // TODO: Add location field to User model
    res.json({
      success: true,
      data: {
        cities: [],
        countries: []
      }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/:id/availability - Get teacher availability
// IMPORTANT: This must come BEFORE the /:id route to avoid conflicts
router.get('/:id/availability', async (req, res) => {
  try {
    const teacher = await User.findOne({
      where: {
        id: req.params.id,
        role: 'teacher',
        isActive: true
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Get availability from teacher_availability table
    const availabilitySlots = await TeacherAvailability.findAll({
      where: {
        teacherId: req.params.id,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'avatarUrl'],
          required: false
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Format availability for frontend (convert to "9:00 AM - 10:00 AM" format)
    const availability = availabilitySlots.map(slot => {
      const startTime12 = convertTo12Hour(slot.startTime);
      const endTime12 = convertTo12Hour(slot.endTime);
      
      return {
        id: slot.id,
        day: slot.dayOfWeek,
        time: `${startTime12} - ${endTime12}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: !slot.isReserved,
        isReserved: slot.isReserved,
        reservedBy: slot.reservedBy,
        student: slot.student ? {
          id: slot.student.id,
          name: slot.student.name,
          avatarUrl: slot.student.avatarUrl
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        availability: availability,
        teacherId: teacher.id,
        teacherName: teacher.name
      }
    });
  } catch (error) {
    console.error('Get teacher availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await User.findOne({
      where: {
        id: req.params.id,
        role: 'teacher',
        isActive: true
      },
      include: [
        {
          model: TeacherProfile,
          as: 'teacherProfile',
          required: true
        }
      ]
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const userData = teacher.toJSON();
    const profile = userData.teacherProfile || {};

    // Fetch availability from teacher_availability table
    const availabilitySlots = await TeacherAvailability.findAll({
      where: {
        teacherId: req.params.id,
        isActive: true
      },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    const availability = availabilitySlots.map(slot => ({
      day: slot.dayOfWeek,
      time: `${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`,
      available: !slot.isReserved
    }));

    const teacherResponse = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatarUrl,
      rating: profile.ratingAvg || 0,
      reviewCount: profile.ratingCount || 0,
      experience: profile.yearsOfExperience || 0,
      location: 'Unknown, Unknown', // TODO: Add location to user model
      subjects: profile.subjects || [],
      availableModes: [profile.learningMode || 'online'],
      pricePerHour: parseFloat(profile.hourlyRate) || 0,
      bio: userData.bio || '',
      isVerified: userData.emailVerified || false,
      languages: userData.languages || ['en'],
      role: 'TEACHER',
      teacherProfile: {
        subjects: profile.subjects || [],
        levels: profile.levels || [],
        yearsOfExperience: profile.yearsOfExperience || 0,
        certifications: profile.certifications || [],
        hourlyRate: parseFloat(profile.hourlyRate) || 0,
        isVolunteer: profile.isVolunteer || false,
        maxStudentsPerSession: profile.maxStudentsPerSession || 1,
        learningMode: profile.learningMode || 'online',
        availability: availability,
        ratingAvg: profile.ratingAvg || 0,
        ratingCount: profile.ratingCount || 0
      }
    };

    res.json({
      success: true,
      data: teacherResponse
    });
  } catch (error) {
    console.error('Get teacher by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;