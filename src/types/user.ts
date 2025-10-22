export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export enum GradeLevel {
  PRIMARY = 'primary',
  PREP = 'prep',
  SECONDARY = 'secondary',
  UNIVERSITY = 'university',
}

export enum LearningMode {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid',
}

export interface Location {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  gender?: string;
  languages: string[];
  location?: Location;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  userId: string;
  gradeLevel: GradeLevel;
  subjectsNeeded: string[];
  learningMode: LearningMode;
  availability: string[];
}

export interface TeacherProfile {
  userId: string;
  subjects: string[];
  levels: string[];
  yearsOfExperience: number;
  certifications: string[];
  hourlyRate?: number;
  isVolunteer: boolean;
  maxStudentsPerSession?: number;
  learningMode: LearningMode;
  availability: string[];
  ratingAvg: number;
  ratingCount: number;
}

export interface UserWithProfile extends User {
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  totalLessons?: number;
  totalReviews?: number;
  averageRating?: number;
  joinDate?: string;
  lastActive?: string;
  completedCourses?: number;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean; // Add optional rtl property
}

// Teacher interface for TeacherCard component
export interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  experience: number;
  location: string;
  subjects: string[];
  availableModes: string[];
  pricePerHour: number;
  bio?: string;
  isVerified?: boolean;
  languages?: string[];
}