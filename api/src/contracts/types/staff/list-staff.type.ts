export interface ListStaffDto {
  search?: string;
  role?: 'owner' | 'staff';
  limit?: number;
}
