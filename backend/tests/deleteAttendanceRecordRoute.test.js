import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/deleteAttendaceRecordController.js", () => ({
  deleteAttendanceRecord: jest.fn((req, res) =>
    res.status(200).json({ message: "Attendance record deleted successfully" })
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
const { default: router } = await import("../routes/deleteAttendanceRecordRoute.js");
const { deleteAttendanceRecord } = await import("../controllers/deleteAttendaceRecordController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/delete-attendance", router);

describe("DELETE /delete-attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'instructor'", () => {
    expect(capturedCheckRoleArg).toBe("instructor");
  });

  it("should return 200 when instructor deletes an attendance record", async () => {
    const res = await request(app)
      .delete("/delete-attendance")
      .send({ recordId: "rec1" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Attendance record deleted successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).delete("/delete-attendance").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the deleteAttendanceRecord controller", async () => {
    await request(app).delete("/delete-attendance").send({});
    expect(deleteAttendanceRecord).toHaveBeenCalled();
  });

  it("should return 403 when an admin tries to delete attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).delete("/delete-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to delete attendance", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).delete("/delete-attendance").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).delete("/delete-attendance").send({});
    expect(res.status).toBe(401);
  });
});
