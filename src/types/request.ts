export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface Request {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  preferredMode: 'online' | 'in_person';
  preferredTime: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestWithDetails extends Request {
  student: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  teacher: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}