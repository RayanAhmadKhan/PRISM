import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/createAttendanceRecord.js", () => ({
  createAttendanceRecord: jest.fn((req, res) =>
    res.status(201).json({ message: "Attendance record created successfully" })
  ),
}));

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: "inst1", role: "instructor" };
    next();
  }),
  checkRole: jest.fn((role) => {
    capturedCheckRoleArg = role;
    return (req, res, next) => {
      if (req.user?.role === role) return next();
      return res.status(403).json({ message: "Forbidden" });
    };
  }),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/createAttendanceroute.js");
const { createAttendanceRecord } = await import("../controllers/createAttendanceRecord.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/create-attendance", router);

describe("POST /create-attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'instructor'", () => {
    expect(capturedCheckRoleArg).toBe("instructor");
  });

  it("should return 201 when instructor creates an attendance record", async () => {
    const res = await request(app)
      .post("/create-attendance")
      .send({ sectionId: "sec1", date: "2026-05-08" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Attendance record created successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/create-attendance").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the createAttendanceRecord controller", async () => {
    await request(app).post("/create-attendance").send({});
    expect(createAttendanceRecord).toHaveBeenCalled();
  });

  it("should return 403 when an admin tries to create attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).post("/create-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to create attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).post("/create-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/create-attendance").send({});
    expect(res.status).toBe(401);
  });
});
