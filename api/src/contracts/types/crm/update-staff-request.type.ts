export interface UpdateStaffRequestDto {
  email?: string;
  fullName?: string;
  role?: "owner" | "staff";
  isActive?: boolean;
}
