import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/getAllUsersController.js", () => ({
  allUsers: jest.fn((req, res) =>
    res.status(200).json({ users: [] })
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
const { default: router } = await import("../routes/getAllUsersRoute.js");
const { allUsers } = await import("../controllers/getAllUsersController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/get-all-users", router);

describe("GET /get-all-users", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin fetches all users", async () => {
    const res = await request(app).get("/get-all-users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).get("/get-all-users");
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the allUsers controller", async () => {
    await request(app).get("/get-all-users");
    expect(allUsers).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to get all users", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).get("/get-all-users");
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 403 when a student tries to get all users", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).get("/get-all-users");
    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).get("/get-all-users");
    expect(res.status).toBe(401);
  });
});