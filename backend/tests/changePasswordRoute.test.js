import { jest } from "@jest/globals";

jest.unstable_mockModule("../controllers/changePasswordController.js", () => ({
  changePassword: jest.fn((req, res) =>
    res.status(200).json({ message: "Password changed successfully" })
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
const { default: router } = await import("../routes/changePasswordRoute.js");
const { changePassword } = await import("../controllers/changePasswordController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/change-password", router);

describe("PATCH /change-password", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 when an authenticated user changes their password", async () => {
    const res = await request(app)
      .patch("/change-password")
      .send({ oldPassword: "old123", newPassword: "new456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password changed successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).patch("/change-password").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the changePassword controller", async () => {
    await request(app).patch("/change-password").send({});
    expect(changePassword).toHaveBeenCalled();
  });

  it("should allow instructor role to change password", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).patch("/change-password").send({});
    expect(res.status).toBe(200);
  });

  it("should allow admin role to change password", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "adm1", role: "admin" };
      next();
    });
    const res = await request(app).patch("/change-password").send({});
    expect(res.status).toBe(200);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).patch("/change-password").send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
