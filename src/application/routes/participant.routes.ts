import { Router } from "express";
import { ParticipantService } from "../../services/ParticipantService";
const router = Router();
const svc = new ParticipantService();

router.post("/", async (req, res, next) => {
  try {
    const created = await svc.register(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const p = await svc.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const updated = await svc.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await svc.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
