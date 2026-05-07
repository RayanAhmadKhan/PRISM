import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/MarkAttendanceController.js", () => ({
  markAttendance: jest.fn((req, res) =>
    res.status(200).json({ message: "Attendance marked successfully" })
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
const { default: router } = await import("../routes/MarkAttendanceRoute.js");
const { markAttendance } = await import("../controllers/MarkAttendanceController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/mark-attendance", router);

describe("POST /mark-attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'instructor'", () => {
    expect(capturedCheckRoleArg).toBe("instructor");
  });

  it("should return 200 when instructor marks attendance", async () => {
    const res = await request(app)
      .post("/mark-attendance")
      .send({ studentId: "stu1", status: "present" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Attendance marked successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/mark-attendance").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the markAttendance controller", async () => {
    await request(app).post("/mark-attendance").send({});
    expect(markAttendance).toHaveBeenCalled();
  });

  it("should return 403 when an admin tries to mark attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).post("/mark-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to mark attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).post("/mark-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/mark-attendance").send({});
    expect(res.status).toBe(401);
  });
});
