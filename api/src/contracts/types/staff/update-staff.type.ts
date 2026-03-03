export interface UpdateStaffDto {
  email?: string;
  fullName?: string;
  role?: 'owner' | 'staff';
  isActive?: boolean;
}
