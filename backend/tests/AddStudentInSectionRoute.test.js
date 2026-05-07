import { jest } from "@jest/globals";

// Track checkRole argument captured at route-load time
let capturedCheckRoleArg;

jest.unstable_mockModule("../controllers/AddStudentInSectionController.js", () => ({
  addStudentInSection: jest.fn((req, res) =>
    res.status(200).json({ message: "Student added to section successfully" })
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
const { default: router } = await import("../routes/AddStudentInSectionRoute.js");
const { addStudentInSection } = await import("../controllers/AddStudentInSectionController.js");
const { verifyToken } = await import("../middleware/authMiddleware.js");

const app = express();
app.use(express.json());
app.use("/add-student-in-section", router);

describe("POST /add-student-in-section", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should call checkRole with 'admin'", () => {
    expect(capturedCheckRoleArg).toBe("admin");
  });

  it("should return 200 when admin adds a student to a section", async () => {
    const res = await request(app)
      .post("/add-student-in-section")
      .send({ studentId: "s1", sectionId: "sec1" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Student added to section successfully");
  });

  it("should call verifyToken middleware", async () => {
    await request(app).post("/add-student-in-section").send({});
    expect(verifyToken).toHaveBeenCalled();
  });

  it("should call the addStudentInSection controller", async () => {
    await request(app).post("/add-student-in-section").send({});
    expect(addStudentInSection).toHaveBeenCalled();
  });

  it("should return 403 when a non-admin user tries to add a student", async () => {
    verifyToken.mockImplementationOnce((req, res, next) => {
      req.user = { id: "stu1", role: "student" };
      next();
    });
    const res = await request(app).post("/add-student-in-section").send({});
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("should return 401 when no token is provided", async () => {
    verifyToken.mockImplementationOnce((req, res) =>
      res.status(401).json({ message: "Unauthorized" })
    );
    const res = await request(app).post("/add-student-in-section").send({});
    expect(res.status).toBe(401);
  });
});
