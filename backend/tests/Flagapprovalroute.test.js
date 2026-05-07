import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/flagApprovalController.js", () => ({
  flagApproval: jest.fn((req, res) =>
    res.status(200).json({ message: "Flag approval updated successfully" })
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
const { default: router } = await import("../routes/flagApprovalRoute.js");
const { flagApproval } = await import("../controllers/flagApprovalController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/flag-approval", router);

describe("PATCH /flag-approval", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'instructor'", () => {
    expect(capturedCheckRoleArg).toBe("instructor");
  });

  it("should return 200 when instructor approves/disapproves a flag", async () => {
    const res = await request(app)
      .patch("/flag-approval")
      .send({ flagId: "f1", approved: true });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Flag approval updated successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).patch("/flag-approval").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the flagApproval controller", async () => {
    await request(app).patch("/flag-approval").send({});
    expect(flagApproval).toHaveBeenCalled();
  });

  it("should return 403 when an admin tries to approve a flag", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).patch("/flag-approval").send({});
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 403 when a student tries to approve a flag", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).patch("/flag-approval").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).patch("/flag-approval").send({});
    expect(res.status).toBe(401);
  });
});