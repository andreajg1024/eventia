import request from "supertest";
import app from "../../src/api/server";
import { AppDataSource } from "../../ormconfig";
import redisClient from "../../src/infrastructure/cache/redisClient";

describe("Events API - Integration", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Evita conexión real a Redis en tests
    jest.spyOn(redisClient, "get").mockResolvedValue(null as any);
    jest.spyOn(redisClient, "set").mockResolvedValue("OK" as any);
    jest.spyOn(redisClient, "del").mockResolvedValue(1 as any);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    jest.restoreAllMocks();
  });

  it("should create an event", async () => {
    const now = new Date();
    const later = new Date(Date.now() + 1000 * 60 * 60);

    const res = await request(app)
      .post("/events")
      .send({
        title: "Integration Event",
        description: "Test desc",
        startsAt: now.toISOString(),
        endsAt: later.toISOString(),
        capacity: 50
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should return list of events", async () => {
    const res = await request(app).get("/events");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
