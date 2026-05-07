import { jest } from "@jest/globals";

jest.unstable_mockModule("../controllers/getSectionController.js", () => ({
  getSectionController: jest.fn((req, res) =>
    res.status(200).json({ message: "Sections retrieved successfully", sections: [] })
  ),
}));

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: "user1", role: "admin" };
    next();
  }),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const { default: router } = await import("../routes/getSelectionRoute.js");
const { getSectionController } = await import("../controllers/getSectionController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/get-section", router);

describe("GET /get-section", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 200 for authenticated user", async () => {
    const res = await request(app).get("/get-section");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sections retrieved successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).get("/get-section");
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the getSectionController", async () => {
    await request(app).get("/get-section");
    expect(getSectionController).toHaveBeenCalled();
  });

  it("should return 200 for admin", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "admin1", role: "admin" };
      next();
    });
    const res = await request(app).get("/get-section");
    expect(res.status).toBe(200);
  });

  it("should return 200 for instructor", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).get("/get-section");
    expect(res.status).toBe(200);
  });

  it("should return 200 for student", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).get("/get-section");
    expect(res.status).toBe(200);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).get("/get-section");
    expect(res.status).toBe(401);
  });
});
