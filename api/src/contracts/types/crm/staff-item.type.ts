export interface StaffItemDto {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'staff';
  isActive: boolean;
}
