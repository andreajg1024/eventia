import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn
} from "typeorm";
import { Event } from "./Event";
import { Participant } from "./Participant";

@Entity()
@Unique(["event", "participant"])
export class Attendance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Event, (e) => e.attendances, { eager: true })
  event!: Event;

  @ManyToOne(() => Participant, (p) => p.attendances, { eager: true })
  participant!: Participant;

  @CreateDateColumn()
  registeredAt!: Date;
}
