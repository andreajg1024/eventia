import { ParticipantRepository } from "../infrastructure/repositories/ParticipantRepository";
import { Participant } from "../domain/entities/Participant";
import { AppError } from "../shared/errors";
import redisClient from "../infrastructure/cache/redisClient";

function isValidEmail(email?: string) {
  if (!email) return false;
  // simple regex, suficiente para validaciones básicas
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export class ParticipantService {
  private repo = new ParticipantRepository();

  async register(data: Partial<Participant>) {
    if (!data.name) throw new AppError("Name is required", 400);
    if (!data.email) throw new AppError("Email is required", 400);
    if (!isValidEmail(data.email)) throw new AppError("Invalid email format", 400);

    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new AppError("Email already registered", 409);

    const p = await this.repo.create({
      name: data.name,
      email: data.email
    } as Partial<Participant>);

    try { await redisClient.del("participants:all"); } catch (e) {}
    return p;
  }

  async findById(id: string) {
    if (!id) throw new AppError("Participant id required", 400);
    const p = await this.repo.findById(id);
    if (!p) throw new AppError("Participant not found", 404);
    return p;
  }

  async update(id: string, patch: Partial<Participant>) {
    if (!id) throw new AppError("Participant id required", 400);
    if (patch.email && !isValidEmail(patch.email)) throw new AppError("Invalid email format", 400);

    // if changing email ensure not duplicate
    if (patch.email) {
      const existing = await this.repo.findByEmail(patch.email);
      if (existing && existing.id !== id) throw new AppError("Email already in use", 409);
    }

    const res = await this.repo.update(id, patch);
    try { await redisClient.del("participants:all"); } catch (e) {}
    return res;
  }

  async delete(id: string) {
    if (!id) throw new AppError("Participant id required", 400);
    await this.repo.delete(id);
    try { await redisClient.del("participants:all"); } catch (e) {}
    return true;
  }
}
