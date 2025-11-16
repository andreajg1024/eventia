import { EventRepository } from "../infrastructure/repositories/EventRepository";
import { Event } from "../domain/entities/Event";
import redisClient from "../infrastructure/cache/redisClient";
import { AppError } from "../shared/errors";

/**
 * Reglas de negocio para eventos:
 * - Crear evento válido (fechas coherentes)
 * - Evitar crear eventos con end < start
 * - No permitir crear eventos en el pasado (opcional, pero implementado)
 * - Cache básico para lista de eventos
 */
export class EventService {
  private repo = new EventRepository();

  async create(data: Partial<Event>) {
    // Validaciones
    if (!data.title) throw new AppError("Title is required", 400);
    if (!data.startsAt || !data.endsAt) throw new AppError("Event dates required", 400);
    const starts = new Date(data.startsAt);
    const ends = new Date(data.endsAt);
    if (isNaN(starts.getTime()) || isNaN(ends.getTime())) throw new AppError("Invalid dates", 400);
    if (ends <= starts) throw new AppError("Event end must be after start", 400);
    if (ends < new Date()) throw new AppError("Event ends in the past", 400);

    // capacity default 0 (unlimited) if not provided
    const event = await this.repo.create({
      title: data.title,
      description: data.description,
      startsAt: starts,
      endsAt: ends,
      capacity: data.capacity ?? 0
    } as Partial<Event>);

    // invalidate cache
    try { await redisClient.del("events:all"); } catch (e) { /* ignore cache failures */ }

    return event;
  }

  async list() {
    // Try cache
    try {
      const cache = await redisClient.get("events:all");
      if (cache) return JSON.parse(cache);
    } catch (e) {
      // ignore cache errors
    }

    const events = await this.repo.findAll();

    try {
      await redisClient.set("events:all", JSON.stringify(events), "EX", 30);
    } catch (e) {}

    return events;
  }

  async findById(id: string) {
    if (!id) throw new AppError("Event id required", 400);
    const ev = await this.repo.findById(id);
    if (!ev) throw new AppError("Event not found", 404);
    return ev;
  }

  async update(id: string, patch: Partial<Event>) {
    if (!id) throw new AppError("Event id required", 400);
    if (patch.startsAt && patch.endsAt) {
      const s = new Date(patch.startsAt as any);
      const e = new Date(patch.endsAt as any);
      if (e <= s) throw new AppError("Event end must be after start", 400);
    }
    const updated = await this.repo.update(id, patch);
    try { await redisClient.del("events:all"); await redisClient.del(`event:${id}:occupancy`); } catch (e) {}
    return updated;
  }

  async delete(id: string) {
    if (!id) throw new AppError("Event id required", 400);
    await this.repo.delete(id);
    try { await redisClient.del("events:all"); await redisClient.del(`event:${id}:occupancy`); } catch (e) {}
    return true;
  }
}
