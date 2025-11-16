import { ParticipantService } from "../../src/services/ParticipantService";
import { Participant } from "../../src/domain/entities/Participant";
import { AppError } from "../../src/shared/errors";

jest.mock("../../src/infrastructure/cache/redisClient", () => ({
  del: jest.fn(),
}));

describe("ParticipantService (unit with mocks)", () => {
  let svc: ParticipantService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Inject mock repository replacing the internal repo
    svc = new ParticipantService();
    (svc as any).repo = mockRepo;
  });

  // -------------------------------
  // register()
  // -------------------------------
  it("should create a participant successfully", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const mockParticipant: Participant = {
      id: "p1",
      name: "Andrea",
      email: "andrea@example.com"
    };

    mockRepo.create.mockResolvedValue(mockParticipant);

    const res = await svc.register({
      name: "Andrea",
      email: "andrea@example.com"
    });

    expect(res).toEqual(mockParticipant);
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it("should throw if email is already registered", async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: "p2" });

    await expect(
      svc.register({ name: "Andrea", email: "andrea@example.com" })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should throw if email is invalid", async () => {
    await expect(
      svc.register({ name: "Andrea", email: "noemail" })
    ).rejects.toBeInstanceOf(AppError);
  });

  // -------------------------------
  // findById()
  // -------------------------------
  it("should return participant by ID", async () => {
    const mockP = { id: "p1", name: "Ana", email: "ana@test.com" };
    mockRepo.findById.mockResolvedValue(mockP);

    const res = await svc.findById("p1");

    expect(res).toEqual(mockP);
  });

  it("should throw if participant does not exist", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(svc.findById("x9")).rejects.toBeInstanceOf(AppError);
  });

  // -------------------------------
  // update()
  // -------------------------------
  it("should update participant successfully", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const updated = { id: "p1", name: "Ana Updated" };
    mockRepo.update.mockResolvedValue(updated);

    const res = await svc.update("p1", { name: "Ana Updated" });

    expect(res).toEqual(updated);
  });

  it("should throw if email already used by another participant", async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: "otherId" });

    await expect(
      svc.update("p1", { email: "duplicate@test.com" })
    ).rejects.toBeInstanceOf(AppError);
  });

  // -------------------------------
  // delete()
  // -------------------------------
  it("should delete participant", async () => {
    mockRepo.delete.mockResolvedValue(true);

    const res = await svc.delete("p1");

    expect(res).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith("p1");
  });
});
