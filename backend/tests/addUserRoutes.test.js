import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/addUserController.js", () => ({
  addUser: jest.fn((req, res) =>
    res.status(201).json({ message: "User added successfully" })
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

jest.unstable_mockModule("multer", () => {
  const multerMock = () => ({
    fields: () => (req, res, next) => next(),
  });
  multerMock.memoryStorage = () => ({});
  return { default: multerMock };
});

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/addUserRoutes.js");
const { addUser } = await import("../controllers/addUserController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/add-user", router);

describe("POST /add-user", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 201 when admin adds a new user", async () => {
    const res = await request(app)
      .post("/add-user")
      .send({ name: "John Doe", role: "student" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User added successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/add-user").send({ name: "Jane" });
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the addUser controller", async () => {
    await request(app).post("/add-user").send({ name: "Jane" });
    expect(addUser).toHaveBeenCalled();
  });

  it("should return 403 when a non-admin tries to add a user", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "u2", role: "instructor" };
      next();
    });
    const res = await request(app).post("/add-user").send({ name: "Jane" });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 401 when no token is present", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/add-user").send({ name: "Jane" });
    expect(res.status).toBe(401);
  });

  it("should accept multipart/form-data (file upload fields)", async () => {
    const res = await request(app)
      .post("/add-user")
      .field("name", "Jane")
      .attach("face", Buffer.from("fakeimagebytes"), "face.jpg");
    expect(res.status).toBe(201);
  });
});
