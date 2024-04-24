const mongoose = require('mongoose'); 

const formSchema = new mongoose.Schema({
   
    playerInformation: {
        playerName: { type: String, required: true },
        team: { type: String, required: true },
        position: { type: String, required: true },

    },
    performanceMetrics: {
        passing: {
            totalPasses: Number,
            successfulPasses: Number,
            passingAccuracy: Number,
            keyPasses: Number
        },
        shooting: {
            totalShots: Number,
            shotsOnTarget: Number,
            goalsScored: Number,
            shotAccuracy: Number
        },
        defending: {
            tackles: Number,
            interceptions: Number,
            clearances: Number,
            blocks: Number
        },
        physical: {
            distanceCovered: Number,
            sprints: Number,
            duelsWon: Number,
            aerialDuelsWon: Number
        },
        creativity: {
            assists: Number,
            crossesCompleted: Number,
            throughBallsCompleted: Number,
            dribblesCompleted: Number
        },
        discipline: {
            yellowCards: Number,
            redCards: Number,
            foulsCommitted: Number,
            foulsSuffered: Number
        },
        overallAssessment: {
            rating: Number,
            comments: String
        }
    },
    additionalObservations: String
});

module.exports = mongoose.model('Form', formSchema);
