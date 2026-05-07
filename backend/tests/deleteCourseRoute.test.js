import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/deleteCourseController.js", () => ({
  deleteCourse: jest.fn((req, res) =>
    res.status(200).json({ message: "Course deleted successfully" })
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
const { default: router } = await import("../routes/deleteCourseRoute.js");
const { deleteCourse } = await import("../controllers/deleteCourseController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/delete-course", router);

describe("DELETE /delete-course", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin deletes a course", async () => {
    const res = await request(app)
      .delete("/delete-course")
      .send({ courseId: "c1" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Course deleted successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).delete("/delete-course").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the deleteCourse controller", async () => {
    await request(app).delete("/delete-course").send({});
    expect(deleteCourse).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to delete a course", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).delete("/delete-course").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to delete a course", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).delete("/delete-course").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).delete("/delete-course").send({});
    expect(res.status).toBe(401);
  });
});
