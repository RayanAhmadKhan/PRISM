import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/Removestudentfromsection.js", () => ({
  removeStudentFromSection: jest.fn((req, res) =>
    res.status(200).json({ message: "Student removed from section successfully" })
  ),
}));

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: "admin1", role: "admin" };
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
const { default: router } = await import("../routes/Removestuedentfromsection.js");
const { removeStudentFromSection } = await import("../controllers/Removestudentfromsection.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/remove-student", router);

describe("DELETE /remove-student", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin removes a student from section", async () => {
    const res = await request(app)
      .delete("/remove-student")
      .send({ rollNumber: "r001", sectionName: "A", courseId: "c1" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Student removed from section successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).delete("/remove-student").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the removeStudentFromSection controller", async () => {
    await request(app).delete("/remove-student").send({});
    expect(removeStudentFromSection).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to remove a student", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).delete("/remove-student").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to remove another student", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).delete("/remove-student").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).delete("/remove-student").send({});
    expect(res.status).toBe(401);
  });
});
