import { DataSource } from "typeorm";
import { Event } from "./src/domain/entities/Event";
import { Participant } from "./src/domain/entities/Participant";
import { Attendance } from "./src/domain/entities/Attendance";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres",
  synchronize: true, // para desarrollo; en producción usa migraciones
  logging: false,
  entities: [Event, Participant, Attendance]
});
