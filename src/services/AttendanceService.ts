import { EventRepository } from "../infrastructure/repositories/EventRepository";
import { ParticipantRepository } from "../infrastructure/repositories/ParticipantRepository";
import { AttendanceRepository } from "../infrastructure/repositories/AttendanceRepository";
import { AppError } from "../shared/errors";
import redisClient from "../infrastructure/cache/redisClient";

export class AttendanceService {
  private eventRepo = new EventRepository();
  private participantRepo = new ParticipantRepository();
  private attendanceRepo = new AttendanceRepository();

  async register(eventId: string, participantId: string) {
    if (!eventId) throw new AppError("Event id required", 400);
    if (!participantId) throw new AppError("Participant id required", 400);

    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    if (event.endsAt && new Date(event.endsAt) < new Date()) {
      throw new AppError("Cannot register to past events", 409);
    }

    const participant = await this.participantRepo.findById(participantId);
    if (!participant) throw new AppError("Participant not found", 404);

    const already = await this.attendanceRepo.findByEventAndParticipant(eventId, participantId);
    if (already) throw new AppError("Participant already registered", 409);

    const occupancyKey = `event:${eventId}:occupancy`;
    let occupancy: number;

    try {
      const cached = await redisClient.get(occupancyKey);
      if (cached != null) occupancy = parseInt(cached);
      else {
        occupancy = await this.attendanceRepo.countByEvent(eventId);
        await redisClient.set(occupancyKey, String(occupancy), "EX", 10);
      }
    } catch {
      occupancy = await this.attendanceRepo.countByEvent(eventId);
    }

    if (event.capacity && event.capacity > 0 && occupancy >= event.capacity) {
      throw new AppError("Event full", 409);
    }

    const attendance = await this.attendanceRepo.create(event, participant);

    try {
      await redisClient.incr(occupancyKey);
    } catch {}

    try {
      await redisClient.del("events:all");
    } catch {}

    return attendance;
  }

  async stats(eventId: string) {
    if (!eventId) throw new AppError("Event id required", 400);

    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    const occupancyKey = `event:${eventId}:occupancy`;
    let occupancy = 0;

    try {
      const cached = await redisClient.get(occupancyKey);
      if (cached != null) occupancy = parseInt(cached);
      else {
        occupancy = await this.attendanceRepo.countByEvent(eventId);
        await redisClient.set(occupancyKey, String(occupancy), "EX", 10);
      }
    } catch {
      occupancy = await this.attendanceRepo.countByEvent(eventId);
    }

    const capacity = event.capacity ?? 0;
    const available = capacity > 0 ? Math.max(0, capacity - occupancy) : Number.POSITIVE_INFINITY;
    const percent = capacity > 0 ? Math.round((occupancy / capacity) * 10000) / 100 : 0;

    return {
      eventId,
      occupancy,
      capacity,
      available,
      percent
    };
  }

  async listAttendees(eventId: string) {
    if (!eventId) throw new AppError("Event id required", 400);
    return await this.attendanceRepo.findByEvent(eventId);
  }
}
