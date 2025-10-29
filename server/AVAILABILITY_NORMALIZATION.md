# Teacher Availability Database Normalization

## Overview
The availability system has been normalized by moving availability data from the `teacher_profiles` table into a dedicated `teacher_availability` table. This provides better data integrity, easier querying, and automatic reservation tracking.

## Database Schema

### Table: `teacher_availability`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `teacher_id` | UUID (FK) | References `users.id` - the teacher who owns this slot |
| `day_of_week` | VARCHAR(20) | Day name: Monday, Tuesday, etc. |
| `start_time` | TIME | Start time in HH:MM:SS format (e.g., 09:00:00) |
| `end_time` | TIME | End time in HH:MM:SS format (e.g., 10:00:00) |
| `is_reserved` | BOOLEAN | `true` if this slot has been booked by a student |
| `reserved_by` | UUID (FK, nullable) | References `users.id` - student who reserved this slot |
| `lesson_request_id` | UUID (FK, nullable) | References `lesson_requests.id` - the associated request |
| `is_active` | BOOLEAN | `false` if teacher removed this availability |
| `created_at` | TIMESTAMP | When this slot was created |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Indexes
- `teacher_id` - Fast lookups by teacher
- `(teacher_id, day_of_week)` - Fast day-specific queries
- `(teacher_id, is_reserved)` - Filter available/reserved slots
- `(is_reserved, is_active)` - Global availability queries

### Foreign Keys
- `teacher_id` → `users.id` (CASCADE on delete/update)
- `reserved_by` → `users.id` (SET NULL on delete)
- `lesson_request_id` → `lesson_requests.id` (SET NULL on delete)

## Benefits

### 1. **Normalized Data Structure**
- Each time slot is a separate row
- No more JSON parsing required
- Standard SQL queries work efficiently

### 2. **Automatic Reservation Tracking**
- `is_reserved` flag shows slot status
- `reserved_by` links to student
- `lesson_request_id` links to the booking

### 3. **Better Querying**
```sql
-- Get all available slots for a teacher
SELECT * FROM teacher_availability 
WHERE teacher_id = '...' 
  AND is_reserved = false 
  AND is_active = true;

-- Get all reserved slots
SELECT ta.*, u.name as student_name 
FROM teacher_availability ta
JOIN users u ON ta.reserved_by = u.id
WHERE ta.teacher_id = '...' 
  AND ta.is_reserved = true;
```

### 4. **Easy Slot Management**
- Teachers can add/remove individual slots
- Soft delete with `is_active` flag
- Historical data preserved

## API Updates Needed

### 1. **GET /api/teachers/:id/availability**
Should now query `teacher_availability` table instead of `teacher_profiles.availability`:

```javascript
const availability = await TeacherAvailability.findAll({
  where: {
    teacherId: teacherId,
    isActive: true
  },
  include: [
    {
      model: User,
      as: 'student',
      attributes: ['id', 'name', 'avatarUrl']
    }
  ],
  order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
});
```

### 2. **PATCH /api/teachers/me (Save Availability)**
Should create/update rows in `teacher_availability`:

```javascript
// Delete old slots (soft delete)
await TeacherAvailability.update(
  { isActive: false },
  { where: { teacherId: teacherId } }
);

// Insert new slots
const slots = availability.map(slot => ({
  teacherId: teacherId,
  dayOfWeek: slot.day,
  startTime: parseTime(slot.time.split(' - ')[0]),
  endTime: parseTime(slot.time.split(' - ')[1]),
  isReserved: false,
  isActive: true
}));

await TeacherAvailability.bulkCreate(slots);
```

### 3. **POST /api/requests (Book Lesson)**
When a request is accepted, mark the slot as reserved:

```javascript
// When accepting a request
await TeacherAvailability.update(
  {
    isReserved: true,
    reservedBy: request.studentId,
    lessonRequestId: request.id
  },
  {
    where: {
      teacherId: request.teacherId,
      dayOfWeek: getDayFromDate(request.preferredTime),
      startTime: getTimeFromDate(request.preferredTime),
      isActive: true
    }
  }
);
```

### 4. **PATCH /api/requests/:id (Accept/Reject)**
- **Accept**: Set `is_reserved = true` in matching slot
- **Reject**: Keep `is_reserved = false`
- **Cancel**: Set `is_reserved = false` to free up the slot

## Migration Status

✅ **Completed:**
- Created `teacher_availability` table
- Added all foreign key relationships
- Added performance indexes
- Created Sequelize model
- Attempted to migrate existing data from JSON

⚠️ **Manual Steps Required:**
1. Update API routes to use new table
2. Update frontend to handle new response format
3. Test booking flow with new schema
4. Migrate any remaining old availability data

## Example Queries

### Get Teacher's Available Slots
```sql
SELECT day_of_week, start_time, end_time
FROM teacher_availability
WHERE teacher_id = 'teacher-uuid'
  AND is_reserved = false
  AND is_active = true
ORDER BY 
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END,
  start_time;
```

### Get Student's Booked Lessons
```sql
SELECT ta.*, u.name as teacher_name, lr.subject
FROM teacher_availability ta
JOIN users u ON ta.teacher_id = u.id
JOIN lesson_requests lr ON ta.lesson_request_id = lr.id
WHERE ta.reserved_by = 'student-uuid'
  AND ta.is_reserved = true
ORDER BY ta.day_of_week, ta.start_time;
```

### Check Slot Conflicts
```sql
SELECT * FROM teacher_availability
WHERE teacher_id = 'teacher-uuid'
  AND day_of_week = 'Monday'
  AND start_time = '09:00:00'
  AND is_active = true;
```

## Next Steps

1. **Update Teacher Routes** - Modify availability save/load endpoints
2. **Update Request Routes** - Add slot reservation logic when accepting
3. **Update Frontend** - Handle new data structure in BookingModal
4. **Test Flow** - Verify booking → acceptance → slot reservation
5. **Data Migration** - Run script to migrate existing availability from JSON

## Rollback

If needed, the migration can be rolled back:
```bash
# This will drop the teacher_availability table
node -e "
const migration = require('./migrations/003-create-availability-table.js');
const { sequelize } = require('./src/config/database');
migration.down(sequelize.getQueryInterface(), sequelize.Sequelize)
  .then(() => { console.log('Rollback complete'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
"
```
