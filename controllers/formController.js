const Form = require("../models/form");
const User=require("../models/User");

async function getPlayers (req, res) {
    try {
        const players = await User.find({ role: 'Player' }, '_id email fullname');
        res.status(200).json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
async function getForm(req, res) {
    try {
        const data = await Form.find();
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
}

async function addForm(req, res) {
    try {
        const newForm = new Form(req.body); // Utilisation correcte de la classe modèle
        const savedForm = await newForm.save();
        res.status(201).send(savedForm); // Envoi de l'objet sauvegardé
    } catch (error) {
        res.status(400).json({ error: error.message }); // Envoi d'un message d'erreur JSON
    }
}

async function deleteForm(req, res) {
    try {
        const deletedForm = await Form.findByIdAndDelete(req.params.id);
        if (!deletedForm) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateForm(req, res) {
    try {
        const updatedForm = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedForm) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json({ message: 'Form has been updated', updatedForm: updatedForm });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function getFormById(req, res) {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getPassingStatistics(req, res) {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        let passingStatistics;

        if (Array.isArray(form)) {
            // Si form est un tableau, calculer les statistiques pour chaque joueur
            passingStatistics = form.map(playerForm => {
                const playerName = playerForm.playerInformation.playerName;
                const successfulPasses = playerForm.performanceMetrics.passing.successfulPasses;
                const totalPasses = playerForm.performanceMetrics.passing.totalPasses;
                const passingAccuracy = totalPasses !== 0 ? ((successfulPasses / totalPasses) * 100).toFixed(2) + '%' : 'N/A';
                const keyPasses = playerForm.performanceMetrics.passing.keyPasses || 0;
                const tackles = playerForm.performanceMetrics.defending.tackles || 0;
                const interceptions = playerForm.performanceMetrics.defending.interceptions || 0;
                const clearances = playerForm.performanceMetrics.defending.clearances || 0;
                const blocks = playerForm.performanceMetrics.defending.blocks || 0;
                const yellowCards = playerForm.performanceMetrics.discipline.yellowCards || 0;
                const redCards = playerForm.performanceMetrics.discipline.redCards || 0;
                const foulsCommitted = playerForm.performanceMetrics.discipline.foulsCommitted || 0;
                const foulsSuffered = playerForm.performanceMetrics.discipline.foulsSuffered || 0;

                const playerStatistics = {
                    playerName,
                    passingAccuracy,
                    keyPasses,
                    successfulPasses,
                    totalPasses,
                    defending: {
                        tackles,
                        interceptions,
                        clearances,
                        blocks
                    },
                    discipline: {
                        yellowCards,
                        redCards,
                        foulsCommitted,
                        foulsSuffered
                    }
                };
                return playerStatistics;
            });
        } else {
            // Si form n'est pas un tableau, calculer les statistiques pour un seul joueur
            const playerName = form.playerInformation.playerName;
            const successfulPasses = form.performanceMetrics.passing.successfulPasses;
            const totalPasses = form.performanceMetrics.passing.totalPasses;
            const passingAccuracy = totalPasses !== 0 ? ((successfulPasses / totalPasses) * 100).toFixed(2) + '%' : 'N/A';
            const keyPasses = form.performanceMetrics.passing.keyPasses || 0;
            const tackles = form.performanceMetrics.defending.tackles || 0;
            const interceptions = form.performanceMetrics.defending.interceptions || 0;
            const clearances = form.performanceMetrics.defending.clearances || 0;
            const blocks = form.performanceMetrics.defending.blocks || 0;
            const yellowCards = form.performanceMetrics.discipline.yellowCards || 0;
            const redCards = form.performanceMetrics.discipline.redCards || 0;
            const foulsCommitted = form.performanceMetrics.discipline.foulsCommitted || 0;
            const foulsSuffered = form.performanceMetrics.discipline.foulsSuffered || 0;

            passingStatistics = [{
                playerName,
                passingAccuracy,
                keyPasses,
                successfulPasses,
                totalPasses,
                defending: {
                    tackles,
                    interceptions,
                    clearances,
                    blocks
                },
                discipline: {
                    yellowCards,
                    redCards,
                    foulsCommitted,
                    foulsSuffered
                }
            }];
        }

        res.status(200).json(passingStatistics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}




module.exports = { getForm, addForm,deleteForm,updateForm,getFormById,getPassingStatistics,getPlayers};

