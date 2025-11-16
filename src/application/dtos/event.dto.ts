export interface CreateEventDTO {
  title: string;
  description?: string;
  startsAt: string; // ISO
  endsAt: string;
  capacity: number;
}
