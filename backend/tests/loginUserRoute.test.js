import { jest } from "@jest/globals";

jest.unstable_mockModule("../controllers/LoginUserController.js", () => ({
  loginUser: jest.fn((req, res) =>
    res.status(200).json({ message: "Login successful", token: "mock-token" })
  ),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/loginUserRoute.js");
const { loginUser } = await import("../controllers/LoginUserController.js");

const app = express();
app.use(express.json());
app.use("/login", router);

describe("POST /login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 with valid credentials", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "admin", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
  });

  it("should return a token on successful login", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "admin", password: "password123" });
    expect(res.body.token).toBe("mock-token");
  });

  it("should call the loginUser controller", async () => {
    await request(app)
      .post("/login")
      .send({ username: "admin", password: "password123" });
    expect(loginUser).toHaveBeenCalled();
  });

  it("should return 401 for invalid credentials", async () => {
    loginUser.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Invalid credentials" })
    );
    const res = await request(app)
      .post("/login")
      .send({ username: "wrong", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should return 400 when body is missing", async () => {
    loginUser.mockImplementationOnce((req, res) =>
      res.status(400).json({ message: "Username and password are required" })
    );
    const res = await request(app).post("/login").send({});
    expect(res.status).toBe(400);
  });

  it("should not require authentication middleware", async () => {
    // login route has no verifyToken — calling without any token should still reach controller
    const res = await request(app)
      .post("/login")
      .send({ username: "admin", password: "password123" });
    expect(res.status).toBe(200);
    expect(loginUser).toHaveBeenCalled();
  });
});
