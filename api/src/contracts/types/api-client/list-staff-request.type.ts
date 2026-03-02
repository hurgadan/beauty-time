export interface ListStaffRequestDto {
  search?: string;
  role?: 'owner' | 'staff';
  limit?: number;
}
