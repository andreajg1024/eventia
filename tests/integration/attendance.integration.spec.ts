import request from "supertest";
import app from "../../src/api/server";
import { AppDataSource } from "../../ormconfig";

describe("Attendance API - Integration", () => {

  let eventId = "";
  let participantId = "";

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Crear data necesaria para registrar asistencia
    const e = await request(app)
      .post("/events")
      .send({
        title: "Event For Attendance",
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        capacity: 10
      });

    eventId = e.body.id;

    const p = await request(app)
      .post("/participants")
      .send({
        name: "User Test",
        email: "user@example.com"
      });

    participantId = p.body.id;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("should register attendance", async () => {
    const res = await request(app)
      .post("/attendance/register")
      .send({
        eventId,
        participantId
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
