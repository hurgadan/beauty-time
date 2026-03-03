export interface UpsertWorkingHoursEntryDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpsertWorkingHoursDto {
  items: UpsertWorkingHoursEntryDto[];
}
