import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Attendance } from "./Attendance";

@Entity()
export class Participant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @OneToMany(() => Attendance, (a) => a.participant)
  attendances?: Attendance[];
}
