export interface UpsertWorkingHoursEntryDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpsertWorkingHoursRequestDto {
  items: UpsertWorkingHoursEntryDto[];
}
