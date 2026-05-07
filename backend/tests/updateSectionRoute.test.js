import { jest } from "@jest/globals";

let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/updateSectionControlller.js", () => ({
  updateSectionController: jest.fn((req, res) =>
    res.status(200).json({ message: "Section updated successfully" })
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
const { default: router } = await import("../routes/updateSectionRoute.js");
const { updateSectionController } = await import("../controllers/updateSectionControlller.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/update-section", router);

describe("PATCH /update-section", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin updates a section", async () => {
    const res = await request(app)
      .patch("/update-section")
      .send({ sectionId: "s1", sectionName: "B" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Section updated successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).patch("/update-section").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the updateSectionController", async () => {
    await request(app).patch("/update-section").send({});
    expect(updateSectionController).toHaveBeenCalled();
  });

  it("should return 403 when an instructor tries to update a section", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "inst1", role: "instructor" };
      next();
    });
    const res = await request(app).patch("/update-section").send({});
    expect(res.status).toBe(403);
  });

  it("should return 403 when a student tries to update a section", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).patch("/update-section").send({});
    expect(res.status).toBe(403);
  });

  it("should return 401 when token is missing", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).patch("/update-section").send({});
    expect(res.status).toBe(401);
  });
});
