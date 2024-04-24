const {
  getForm,
  addForm,
  deleteForm,
  updateForm,
  getFormById,
} = require("../controllers/formController");

const Form = require("../models/form");

jest.mock("../models/form");

describe("getForm", () => {
  it("should return all forms", async () => {
    const formData = [
      {
        /* Sample form data */
      },
    ];
    Form.find.mockResolvedValue(formData);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getForm(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(formData);
  });

  it("should return 400 if an error occurs", async () => {
    Form.find.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});
describe("addForm", () => {
  it("should add a new form", async () => {
    const newFormData = {
      /* Sample new form data */
    };
    const savedFormData = {
      /* Sample saved form data */
    };
    const req = { body: newFormData };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    Form.prototype.save.mockResolvedValue(savedFormData);

    await addForm(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(savedFormData);
  });

  it("should return 400 if an error occurs", async () => {
    const newFormData = {
      /* Sample new form data */
    };
    const req = { body: newFormData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.prototype.save.mockRejectedValue(new Error("Validation error"));

    await addForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
  });
});

describe("deleteForm", () => {
  it("should delete the specified form", async () => {
    const deletedFormId = "1"; // ID of the form to be deleted
    const deletedForm = {
      /* Sample deleted form data */
    };
    const req = { params: { id: deletedFormId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndDelete.mockResolvedValue(deletedForm);

    await deleteForm(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form deleted successfully",
    });
  });

  it("should return 404 if form not found", async () => {
    const deletedFormId = "1"; // ID of the form to be deleted
    const req = { params: { id: deletedFormId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndDelete.mockResolvedValue(null);

    await deleteForm(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Form not found" });
  });

  it("should return 500 if an error occurs", async () => {
    const deletedFormId = "1"; // ID of the form to be deleted
    const req = { params: { id: deletedFormId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndDelete.mockRejectedValue(new Error("Database error"));

    await deleteForm(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
describe("updateForm", () => {
  it("should update the specified form", async () => {
    const updatedFormId = "1"; // ID of the form to be updated
    const updatedFormData = {
      /* Sample updated form data */
    };
    const updatedForm = {
      /* Sample updated form data after update */
    };
    const req = { params: { id: updatedFormId }, body: updatedFormData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndUpdate.mockResolvedValue(updatedForm);

    await updateForm(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form has been updated",
      updatedForm: updatedForm,
    });
  });

  it("should return 404 if form not found", async () => {
    const updatedFormId = "1"; // ID of the form to be updated
    const updatedFormData = {
      /* Sample updated form data */
    };
    const req = { params: { id: updatedFormId }, body: updatedFormData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndUpdate.mockResolvedValue(null);

    await updateForm(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Form not found" });
  });

  it("should return 400 if an error occurs", async () => {
    const updatedFormId = "1"; // ID of the form to be updated
    const updatedFormData = {
      /* Sample updated form data */
    };
    const req = { params: { id: updatedFormId }, body: updatedFormData };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findByIdAndUpdate.mockRejectedValue(new Error("Validation error"));

    await updateForm(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
  });
});

describe("getFormById", () => {
  it("should return the specified form", async () => {
    const formId = "1"; // ID of the form to be retrieved
    const formData = {
      /* Sample form data */
    };
    const req = { params: { id: formId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findById.mockResolvedValue(formData);

    await getFormById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(formData);
  });

  it("should return 404 if form not found", async () => {
    const formId = "1"; // ID of the form to be retrieved
    const req = { params: { id: formId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findById.mockResolvedValue(null);

    await getFormById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Form not found" });
  });

  it("should return 500 if an error occurs", async () => {
    const formId = "1"; // ID of the form to be retrieved
    const req = { params: { id: formId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Form.findById.mockRejectedValue(new Error("Database error"));

    await getFormById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
