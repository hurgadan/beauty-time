export interface CreateStaffDto {
  email: string;
  fullName: string;
  role?: 'owner' | 'staff';
  isActive?: boolean;
}
