import { EventService } from "../../src/services/EventService";
import { AppError } from "../../src/shared/errors";

// ==== MOCK REDIS ====
jest.mock("../../src/infrastructure/cache/redisClient", () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true)
}));
import redisClient from "../../src/infrastructure/cache/redisClient";

// ==== MOCK REPOSITORY ====
const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

// Sobrescribir el repositorio privado del servicio
jest.mock("../../src/infrastructure/repositories/EventRepository", () => {
  return {
    EventRepository: jest.fn().mockImplementation(() => mockRepo)
  };
});

import { Event } from "../../src/domain/entities/Event";

describe("EventService Unit Tests", () => {
  let service: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService();
  });

  // ============================================================
  // CREATE
  // ============================================================
  it("should create an event successfully", async () => {
    const fakeEvent: Event = {
      id: "uuid-1",
      title: "Test Event",
      description: "Test Desc",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 10000),
      capacity: 50
    };

    mockRepo.create.mockResolvedValue(fakeEvent);

    const res = await service.create({
      title: fakeEvent.title,
      description: fakeEvent.description,
      startsAt: fakeEvent.startsAt,
      endsAt: fakeEvent.endsAt,
      capacity: fakeEvent.capacity
    });

    expect(res).toEqual(fakeEvent);
    expect(redisClient.del).toHaveBeenCalledWith("events:all");
  });

  // ============================================================
  // LIST
  // ============================================================
  it("should list events when no cache exists", async () => {
    const fakeList = [
      { id: "1", title: "A", startsAt: new Date(), endsAt: new Date() }
    ];

    mockRepo.findAll.mockResolvedValue(fakeList);

    const res = await service.list();

    expect(res).toEqual(fakeList);
    expect(redisClient.set).toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================
  it("should return event by id", async () => {
    const fakeEvent = {
      id: "1",
      title: "Test",
      startsAt: new Date(),
      endsAt: new Date()
    };

    mockRepo.findById.mockResolvedValue(fakeEvent);

    const res = await service.findById("1");

    expect(res).toEqual(fakeEvent);
  });

  it("should throw 404 when event not found", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.findById("abc")).rejects.toThrow(AppError);
  });

  // ============================================================
  // UPDATE
  // ============================================================
  it("should update an event", async () => {
    const updatedEvent = {
      id: "1",
      title: "Updated Title",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 10000)
    };

    // update puede devolver null → lo manejamos en test
    mockRepo.update.mockResolvedValue(updatedEvent);

    const res = (await service.update("1", { title: "Updated Title" })) as any;

    expect(res.title).toBe("Updated Title");
    expect(redisClient.del).toHaveBeenCalledWith("events:all");
  });

  // ============================================================
  // DELETE
  // ============================================================
  it("should delete an event", async () => {
    mockRepo.delete.mockResolvedValue(true);

    const res = await service.delete("1");

    expect(res).toBe(true);
    expect(redisClient.del).toHaveBeenCalledWith("events:all");
  });
});
