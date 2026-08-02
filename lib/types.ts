export type Role = 'admin' | 'employee';

export type TaskType =
  | 'moving'
  | 'cleaning'
  | 'construction'
  | 'garbage-collection';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface User {
  _id: string;
  name: string;
  employeeId: string;
  address?: string;
  phone?: string;
  role: Role;
  speciality?: string;
}

export interface Client {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

export interface HourLog {
  serial?: number;
  date: string;
  hours: number;
  employee?: string;
  employeeId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface AssignedEmployee {
  _id: string;
  name: string;
  employeeId: string;
  speciality?: string;
}

export interface Task {
  _id: string;
  taskType: TaskType;
  numEmployees: number;
  description: string;
  assignedEmployees: Array<string | AssignedEmployee>;
  client: string | { _id?: string; name: string; address: string; phone: string };
  status: TaskStatus;
  startDate?: string;
  endDate?: string;
  hoursLogged: HourLog[];
  photos: string[];
  createdBy: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
