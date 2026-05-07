import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/changeCourseInfoController.js", () => ({
  changeCourseInfo: jest.fn((req, res) =>
    res.status(200).json({ message: "Course info updated successfully" })
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
const { default: router } = await import("../routes/changeCourseInfoRoute.js");
const { changeCourseInfo } = await import("../controllers/changeCourseInfoController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/change-course-info", router);

describe("PATCH /change-course-info", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin updates course info", async () => {
    const res = await request(app)
      .patch("/change-course-info")
      .send({ courseId: "c1", name: "Advanced Math" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Course info updated successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).patch("/change-course-info").send({ courseId: "c1" });
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the changeCourseInfo controller", async () => {
    await request(app).patch("/change-course-info").send({ courseId: "c1" });
    expect(changeCourseInfo).toHaveBeenCalled();
  });

  it("should return 403 for non-admin users", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "u2", role: "student" };
      next();
    });
    const res = await request(app).patch("/change-course-info").send({ courseId: "c1" });
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).patch("/change-course-info").send({ courseId: "c1" });
    expect(res.status).toBe(401);
  });
});
