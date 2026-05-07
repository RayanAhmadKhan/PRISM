import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/createCourseController.js", () => ({
  createCourse: jest.fn((req, res) =>
    res.status(201).json({ message: "Course created successfully" })
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
const { default: router } = await import("../routes/createCourseRoute.js");
const { createCourse } = await import("../controllers/createCourseController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/create-course", router);

describe("POST /create-course", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 201 when admin creates a course", async () => {
    const res = await request(app)
      .post("/create-course")
      .send({ name: "Data Structures", code: "CS301" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Course created successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/create-course").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the createCourse controller", async () => {
    await request(app).post("/create-course").send({});
    expect(createCourse).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to create a course", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).post("/create-course").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/create-course").send({});
    expect(res.status).toBe(401);
  });
});
