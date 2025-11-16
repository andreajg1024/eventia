import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Attendance } from "./Attendance";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "timestamp" })
  startsAt!: Date;

  @Column({ type: "timestamp" })
  endsAt!: Date;

  @Column({ default: 0 })
  capacity!: number;

  @OneToMany(() => Attendance, (a) => a.event)
  attendances?: Attendance[];
}
