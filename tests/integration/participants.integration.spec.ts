import request from "supertest";
import app from "../../src/api/server";
import { AppDataSource } from "../../ormconfig";

describe("Participants API - Integration", () => {

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("should create a participant", async () => {
    const res = await request(app)
      .post("/participants")
      .send({
        name: "Andrea Test",
        email: "andrea@example.com"
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should list participants", async () => {
    const res = await request(app).get("/participants");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
