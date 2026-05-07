import { jest } from "@jest/globals";

jest.unstable_mockModule("../controllers/getCourseController.js", () => ({
  getCourse: jest.fn((req, res) =>
    res.status(200).json({ courses: [] })
  ),
}));

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: "user1", role: "student" };
    next();
  }),
  checkRole: jest.fn((role) => (req, res, next) => next()),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/getCourseRoute.js");
const { getCourse } = await import("../controllers/getCourseController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/get-course", router);

describe("GET /get-course", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 for any authenticated user", async () => {
    const res = await request(app).get("/get-course");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("courses");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).get("/get-course");
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the getCourse controller", async () => {
    await request(app).get("/get-course");
    expect(getCourse).toHaveBeenCalled();
  });

  it("should allow instructor role to view courses", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).get("/get-course");
    expect(res.status).toBe(200);
  });

  it("should allow admin role to view courses", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "adm1", role: "admin" };
      next();
    });
    const res = await request(app).get("/get-course");
    expect(res.status).toBe(200);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).get("/get-course");
    expect(res.status).toBe(401);
  });
});