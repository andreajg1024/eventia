import { AppDataSource } from "../../../ormconfig";
import { Attendance } from "../../domain/entities/Attendance";
import { Repository } from "typeorm";
import { Event } from "../../domain/entities/Event";
import { Participant } from "../../domain/entities/Participant";

export class AttendanceRepository {
  private repo: Repository<Attendance>;
  constructor() {
    this.repo = AppDataSource.getRepository(Attendance);
  }

  async create(event: Event, participant: Participant) {
    const a = this.repo.create({ event, participant });
    return this.repo.save(a);
  }

  async findByEventAndParticipant(eventId: string, participantId: string) {
    return this.repo.findOne({
      where: { event: { id: eventId }, participant: { id: participantId } }
    });
  }

  async countByEvent(eventId: string) {
    return this.repo.count({ where: { event: { id: eventId } } });
  }

  async findByEvent(eventId: string) {
    return this.repo.find({ where: { event: { id: eventId } } });
  }
}
