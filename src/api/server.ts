import "reflect-metadata";
import express from "express";
import cors from "cors";
import config from "../config";
import eventRoutes from "../application/routes/event.routes";
import participantRoutes from "../application/routes/participant.routes";
import attendanceRoutes from "../application/routes/attendance.routes";
import { initDb } from "../infrastructure/database";
import redisClient from "../infrastructure/cache/redisClient";
import "express-async-errors";
import { AppError } from "../shared/errors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/participants", participantRoutes);
app.use("/attendance", attendanceRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
});

const start = async () => {
  try {
    await initDb();
    // ❌ Quitar la conexión manual de Redis
    // redisClient.connect?.();

    app.listen(config.port, () =>
      console.log(`Server running on port ${config.port}`)
    );
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
};

start();

export default app;
