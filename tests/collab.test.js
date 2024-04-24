const {
  getPhysiotherapists,
  getDoctors,
  getPlayers,
} = require("../controllers/meetingController");
const User = require("../models/User");

jest.mock("../models/User");

describe("getPhysiotherapists", () => {
  it("should return an array of physiotherapists with their ids and emails", async () => {
    const physiotherapistsData = [
      { _id: "1", email: "physio1@example.com" },
      { _id: "2", email: "physio2@example.com" },
    ];

    User.find.mockResolvedValue(physiotherapistsData);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPhysiotherapists(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(physiotherapistsData);
  });

  it("should return 500 if an error occurs", async () => {
    User.find.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPhysiotherapists(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur interne du serveur",
    });
  });
});
describe("getDoctors", () => {
  it("should return an array of doctors with their ids and emails", async () => {
    const doctorsData = [
      { _id: "1", email: "doctor1@example.com" },
      { _id: "2", email: "doctor2@example.com" },
    ];

    User.find.mockResolvedValue(doctorsData);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(doctorsData);
  });

  it("should return 500 if an error occurs", async () => {
    User.find.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getDoctors(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur interne du serveur",
    });
  });
});

describe("getPlayers", () => {
  it("should return an array of players with their ids and emails", async () => {
    const playersData = [
      { _id: "1", email: "player1@example.com" },
      { _id: "2", email: "player2@example.com" },
    ];

    User.find.mockResolvedValue(playersData);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPlayers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(playersData);
  });

  it("should return 500 if an error occurs", async () => {
    User.find.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPlayers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur interne du serveur",
    });
  });
});
