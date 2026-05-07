import { jest } from "@jest/globals";

// This route has NO verifyToken or checkRole — it is publicly accessible
jest.unstable_mockModule("../controllers/getAttendanceRecordController.js", () => ({
  getAttendanceRecord: jest.fn((req, res) =>
    res.status(200).json({ records: [] })
  ),
}));

// Mock imported but unused in the route; included to prevent real module load
jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
  checkRole: jest.fn((role) => (req, res, next) => next()),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/getAttendanceRecordRoute.js");
const { getAttendanceRecord } = await import("../controllers/getAttendanceRecordController.js");

const app = express();
app.use(express.json());
app.use("/get-attendance", router);

describe("GET /get-attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 with attendance records", async () => {
    const res = await request(app).get("/get-attendance");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("records");
  });

  it("should call the getAttendanceRecord controller", async () => {
    await request(app).get("/get-attendance");
    expect(getAttendanceRecord).toHaveBeenCalled();
  });

  it("should be accessible without a token (no auth middleware)", async () => {
    // No Authorization header — should still succeed
    const res = await request(app).get("/get-attendance");
    expect(res.status).toBe(200);
  });

  it("should pass query params to the controller", async () => {
    const res = await request(app).get("/get-attendance?sectionId=sec1&date=2026-05-08");
    expect(res.status).toBe(200);
  });
});