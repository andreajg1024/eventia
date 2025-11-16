import { AttendanceService } from "../../src/services/AttendanceService";
import redisClient from "../../src/infrastructure/cache/redisClient";
import { EventRepository } from "../../src/infrastructure/repositories/EventRepository";
import { ParticipantRepository } from "../../src/infrastructure/repositories/ParticipantRepository";
import { AttendanceRepository } from "../../src/infrastructure/repositories/AttendanceRepository";

// ---------- MOCKS DE MÓDULOS ----------
jest.mock("../../src/infrastructure/cache/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn()
  }
}));

jest.mock("../../src/infrastructure/repositories/EventRepository");
jest.mock("../../src/infrastructure/repositories/ParticipantRepository");
jest.mock("../../src/infrastructure/repositories/AttendanceRepository");

// ---------- TESTS ----------
describe("AttendanceService.register", () => {
  let service: AttendanceService;

  beforeEach(() => {
    service = new AttendanceService();
    jest.clearAllMocks();
  });

  test("debe registrar asistencia correctamente", async () => {
    // Mock: evento existe
    (EventRepository.prototype.findById as jest.Mock).mockResolvedValue({
      id: "e1",
      capacity: 10,
      endsAt: null
    });

    // Mock: participante existe
    (ParticipantRepository.prototype.findById as jest.Mock).mockResolvedValue({
      id: "p1",
      email: "test@mail.com"
    });

    // Mock: no doble registro
    (AttendanceRepository.prototype.findByEventAndParticipant as jest.Mock)
      .mockResolvedValue(null);

    // Mock Redis occupancy
    (redisClient.get as jest.Mock).mockResolvedValue("2");

    // Mock creación de asistencia
    (AttendanceRepository.prototype.create as jest.Mock).mockResolvedValue({
      id: "a1",
      eventId: "e1",
      participantId: "p1"
    });

    const result = await service.register("e1", "p1");

    expect(result).toEqual({
      id: "a1",
      eventId: "e1",
      participantId: "p1"
    });

    expect(redisClient.incr).toHaveBeenCalled();
  });

  test("debe fallar si el evento no existe", async () => {
    (EventRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.register("e1", "p1"))
      .rejects
      .toThrow("Event not found");
  });

  test("debe fallar si el participante no existe", async () => {
    (EventRepository.prototype.findById as jest.Mock).mockResolvedValue({ id: "e1" });
    (ParticipantRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.register("e1", "p1"))
      .rejects
      .toThrow("Participant not found");
  });

  test("debe fallar si el participante ya está registrado", async () => {
    (EventRepository.prototype.findById as jest.Mock).mockResolvedValue({ id: "e1" });
    (ParticipantRepository.prototype.findById as jest.Mock).mockResolvedValue({ id: "p1" });
    (AttendanceRepository.prototype.findByEventAndParticipant as jest.Mock)
      .mockResolvedValue({ id: "reg1" });

    await expect(service.register("e1", "p1"))
      .rejects
      .toThrow("Participant already registered");
  });

  test("debe fallar si el evento está lleno", async () => {
    (EventRepository.prototype.findById as jest.Mock).mockResolvedValue({
      id: "e1",
      capacity: 2
    });

    (ParticipantRepository.prototype.findById as jest.Mock).mockResolvedValue({ id: "p1" });
    (AttendanceRepository.prototype.findByEventAndParticipant as jest.Mock).mockResolvedValue(null);

    // ocupación = 2 (evento lleno)
    (redisClient.get as jest.Mock).mockResolvedValue("2");

    await expect(service.register("e1", "p1"))
      .rejects
      .toThrow("Event full");
  });
});
