import { Router } from "express";
import { AttendanceService } from "../../services/AttendanceService";
const router = Router();
const svc = new AttendanceService();

router.post("/", async (req, res, next) => {
  try {
    const { eventId, participantId } = req.body;
    const created = await svc.register(eventId, participantId);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/stats/:eventId", async (req, res, next) => {
  try {
    const stats = await svc.stats(req.params.eventId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get("/attendees/:eventId", async (req, res, next) => {
  try {
    const list = await svc.listAttendees(req.params.eventId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

export default router;
