import { AppDataSource } from "../../../ormconfig";
import { Participant } from "../../domain/entities/Participant";
import { Repository } from "typeorm";

export class ParticipantRepository {
  private repo: Repository<Participant>;
  constructor() {
    this.repo = AppDataSource.getRepository(Participant);
  }

  async create(partial: Partial<Participant>) {
    const p = this.repo.create(partial);
    return this.repo.save(p);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, patch: Partial<Participant>) {
    await this.repo.update(id, patch);
    return this.findById(id);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
