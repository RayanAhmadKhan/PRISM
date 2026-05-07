import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/deleteUserController.js", () => ({
  deleteUser: jest.fn((req, res) =>
    res.status(200).json({ message: "User deleted successfully" })
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
const { default: router } = await import("../routes/deleteUserRouter.js");
const { deleteUser } = await import("../controllers/deleteUserController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/delete-user", router);

describe("DELETE /delete-user", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin deletes a user", async () => {
    const res = await request(app)
      .delete("/delete-user")
      .send({ userId: "u1" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).delete("/delete-user").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the deleteUser controller", async () => {
    await request(app).delete("/delete-user").send({});
    expect(deleteUser).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to delete a user", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).delete("/delete-user").send({});
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 403 when a student tries to delete a user", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).delete("/delete-user").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).delete("/delete-user").send({});
    expect(res.status).toBe(401);
  });
});