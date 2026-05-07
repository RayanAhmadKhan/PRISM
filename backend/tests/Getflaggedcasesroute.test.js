import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/getFlagedCasesController.js", () => ({
  getFlaggedCases: jest.fn((req, res) =>
    res.status(200).json({ flaggedCases: [] })
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
const { default: router } = await import("../routes/getFlaggedCasesRoute.js");
const { getFlaggedCases } = await import("../controllers/getFlagedCasesController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/get-flagged-cases", router);

describe("GET /get-flagged-cases", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'instructor'", () => {
    expect(capturedCheckRoleArg).toBe("instructor");
  });

  it("should return 200 when instructor fetches flagged cases", async () => {
    const res = await request(app).get("/get-flagged-cases");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("flaggedCases");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).get("/get-flagged-cases");
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the getFlaggedCases controller", async () => {
    await request(app).get("/get-flagged-cases");
    expect(getFlaggedCases).toHaveBeenCalled();
  });

  it("should return 403 when an admin tries to get flagged cases", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).get("/get-flagged-cases");
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 403 when a student tries to get flagged cases", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).get("/get-flagged-cases");
    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).get("/get-flagged-cases");
    expect(res.status).toBe(401);
  });
});