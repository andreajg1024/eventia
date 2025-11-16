import { Router } from "express";
import { EventService } from "../../services/EventService";
const router = Router();
const svc = new EventService();

router.post("/", async (req, res, next) => {
  try {
    const dto = req.body;
    const created = await svc.create({ ...dto, startsAt: new Date(dto.startsAt), endsAt: new Date(dto.endsAt) });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const list = await svc.list();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const ev = await svc.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Not found" });
    res.json(ev);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const patched = await svc.update(req.params.id, req.body);
    res.json(patched);
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
