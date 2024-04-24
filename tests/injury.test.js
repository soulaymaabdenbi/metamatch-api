const mongoose = require("mongoose");
const Injury = require("../models/injury");

describe("Injury Model Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/metamatch", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Should create a new injury", async () => {
    const injuryData = {
      player_id: new mongoose.Types.ObjectId(),
      date: new Date(),
      type: "Fracture",
      description: "Fracture de la jambe droite",
      recovery_status: "In Progress",
      duration: new Date(),
    };

    const newInjury = new Injury(injuryData);
    const savedInjury = await newInjury.save();

    expect(savedInjury).toMatchObject(injuryData);
    expect(savedInjury._id).toBeDefined();
  });

  it("Should update an existing injury", async () => {
    const injuryToUpdate = await Injury.findOne({ type: "Fracture" });
    const newType = "Entorse";

    injuryToUpdate.type = newType;
    const updatedInjury = await injuryToUpdate.save();

    expect(updatedInjury.type).toEqual(newType);
  });

  it("Should delete an existing injury", async () => {
    const injuryToDelete = new Injury({
      player_id: new mongoose.Types.ObjectId(),
      date: new Date(),
      type: "Entorse",
      description: "Entorse de la cheville",
      recovery_status: "In Progress",
      duration: new Date(),
    });

    await injuryToDelete.save();

    const deletedInjury = await Injury.findByIdAndDelete(injuryToDelete._id);

    const deletedInjuryCheck = await Injury.findById(injuryToDelete._id);
    expect(deletedInjuryCheck).toBeNull();
  });
});
