export interface CreateStaffRequestDto {
  email: string;
  fullName: string;
  role?: 'owner' | 'staff';
  isActive?: boolean;
}
