import { AppDataSource } from "../../../ormconfig";
import { Event } from "../../domain/entities/Event";
import { Repository } from "typeorm";

export class EventRepository {
  private repo: Repository<Event>;
  constructor() {
    this.repo = AppDataSource.getRepository(Event);
  }

  async create(event: Partial<Event>) {
    const e = this.repo.create(event);
    return this.repo.save(e);
  }

  async update(id: string, patch: Partial<Event>) {
    await this.repo.update(id, patch);
    return this.repo.findOneBy({ id });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll() {
    return this.repo.find();
  }
}
