import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/createSectionController.js", () => ({
  createSection: jest.fn((req, res) =>
    res.status(201).json({ message: "Section created successfully" })
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
const { default: router } = await import("../routes/createSectionRoute.js");
const { createSection } = await import("../controllers/createSectionController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/create-section", router);

describe("POST /create-section", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 201 when admin creates a section", async () => {
    const res = await request(app)
      .post("/create-section")
      .send({ courseId: "c1", name: "Section A" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Section created successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/create-section").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the createSection controller", async () => {
    await request(app).post("/create-section").send({});
    expect(createSection).toHaveBeenCalled();
  });

  it("should return 403 when a student tries to create a section", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).post("/create-section").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/create-section").send({});
    expect(res.status).toBe(401);
  });
});
