const User = require('../models/User');
const Meeting = require('../models/Meeting');
const nodemailer = require('nodemailer');



exports.getPhysiotherapists = async (req, res) => {   
    try {
        const physiotherapists = await User.find({ role: 'Physiotherapist' }, '_id email');
        res.status(200).json(physiotherapists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor' }, '_id email');
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.getPlayers = async (req, res) => {
    try {
        const players = await User.find({ role: 'Player' }, '_id email username fullname');
        res.status(200).json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.getMeetingsByPlayerId = async (req, res) => {
    const playerId = req.params.playerId;
    try {
        const meetings = await Meeting.find({ participants: playerId });
        res.status(200).json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};


exports.getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find().populate('participants');
        res.status(200).json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
/*
exports.scheduleMeeting = async (req, res) => {
    const { meetingName, meetingDate, selectedPhysiotherapist, description, playerId, playerEmail } = req.body;

    try {
        if (!meetingName || !meetingDate || !selectedPhysiotherapist || !playerId) {
            return res.status(400).json({ message: 'Le nom, la date de la réunion, le physiothérapeute sélectionné ou l\'identifiant du joueur est manquant' });
        }

        if (new Date(meetingDate) < new Date()) {
            return res.status(400).json({ message: 'La date de la réunion doit être aujourd\'hui ou dans le futur' });
        }

        if (!mongoose.Types.ObjectId.isValid(playerId) || !mongoose.Types.ObjectId.isValid(selectedPhysiotherapist)) {
            return res.status(400).json({ message: 'Les identifiants des participants ne sont pas valides' });
        }

        const playerIdObjectId = new mongoose.Types.ObjectId(playerId);
        const selectedPhysiotherapistObjectId = new mongoose.Types.ObjectId(selectedPhysiotherapist);

        const meeting = new Meeting({
            name: meetingName,
            date: meetingDate,
            participants: [playerIdObjectId, selectedPhysiotherapistObjectId],
            description
        });
        await meeting.save();

        const physiotherapistEmail = selectedPhysiotherapist;
        const confirmationLink = generateConfirmationLink(meeting._id);

        await sendEmail(physiotherapistEmail, 'Confirmation de réunion', `Cliquez sur ce lien pour confirmer la réunion : ${confirmationLink}`);

        const jitsiMeetLink = generateJitsiMeetLink(meeting.name, meeting.date);
        const emailSubject = 'Lien Jitsi Meet Pour La Réunion';
        const emailBody = `Bonjour, vous avez organisé une réunion.\n\nDate: ${meeting.date}\nLien: ${jitsiMeetLink}`;

        await Promise.all([
            sendEmail(playerEmail, emailSubject, emailBody),
            sendEmail(physiotherapistEmail, emailSubject, emailBody)
        ]);

        res.status(201).json(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};*/
exports.scheduleMeeting = async (req, res) => {
    const { meetingName, meetingDate, selectedPhysiotherapist, description, playerId, playerEmail } = req.body;

    try {
   
        if (!meetingName || !meetingDate || !selectedPhysiotherapist || !playerId) {
            return res.status(400).json({ message: 'Le nom, la date de la réunion, le physiothérapeute sélectionné ou l\'identifiant du joueur est manquant' });
        }

       
        if (new Date(meetingDate) < new Date()) {
            return res.status(400).json({ message: 'La date de la réunion doit être aujourd\'hui ou dans le futur' });
        }

      
        const physiotherapist = await User.findOne({ email: selectedPhysiotherapist });

       
        if (!physiotherapist) {
            return res.status(400).json({ message: 'Le physiothérapeute sélectionné n\'existe pas' });
        }

        
        const playerIdObjectId = new mongoose.Types.ObjectId(playerId);

        
        const selectedPhysiotherapistObjectId = physiotherapist._id;

        const meeting = new Meeting({
            name: meetingName,
            date: meetingDate,
            participants: [playerIdObjectId, selectedPhysiotherapistObjectId],
            description
        });
        await meeting.save();

        
        const physiotherapistEmail = selectedPhysiotherapist;
        const confirmationLink = generateConfirmationLink(meeting._id);

        await sendEmail(physiotherapistEmail, 'Confirmation de réunion', `Cliquez sur ce lien pour confirmer la réunion : ${confirmationLink}`);

        const jitsiMeetLink = generateJitsiMeetLink(meeting.name, meeting.date);
        const emailSubject = 'Lien Jitsi Meet Pour La Réunion';
        const emailBody = `Bonjour, vous avez organisé une réunion.\n\nDate: ${meeting.date}\nLien: ${jitsiMeetLink}`;

        await Promise.all([
            sendEmail(playerEmail, emailSubject, emailBody),
            sendEmail(physiotherapistEmail, emailSubject, emailBody)
        ]);

        res.status(201).json(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.scheduleMeetingWithDoctor = async (req, res) => {
    const { meetingName, meetingDate, selectedDoctor, description, playerId, playerEmail } = req.body;


    try {
   
        if (!meetingName || !meetingDate || !selectedDoctor || !playerId) {
            return res.status(400).json({ message: 'Le nom, la date de la réunion, le physiothérapeute sélectionné ou l\'identifiant du joueur est manquant' });
        }

       
        if (new Date(meetingDate) < new Date()) {
            return res.status(400).json({ message: 'La date de la réunion doit être aujourd\'hui ou dans le futur' });
        }

      
        const doctor = await User.findOne({ email: selectedDoctor });

       
        if (!doctor) {
            return res.status(400).json({ message: 'Le physiothérapeute sélectionné n\'existe pas' });
        }

        
        const playerIdObjectId = new mongoose.Types.ObjectId(playerId);

        
        const selecteddoctorObjectId = doctor._id;

        const meeting = new Meeting({
            name: meetingName,
            date: meetingDate,
            participants: [playerIdObjectId, selecteddoctorObjectId],
            description
        });
        await meeting.save();

        
        const doctorEmail = selectedDoctor;
        const confirmationLink = generateConfirmationLink(meeting._id);

        await sendEmail(doctorEmail, 'Confirmation de réunion', `Cliquez sur ce lien pour confirmer la réunion : ${confirmationLink}`);

        const jitsiMeetLink = generateJitsiMeetLink(meeting.name, meeting.date);
        const emailSubject = 'Lien Jitsi Meet Pour La Réunion';
        const emailBody = `Bonjour, vous avez organisé une réunion.\n\nDate: ${meeting.date}\nLien: ${jitsiMeetLink}`;

        await Promise.all([
            sendEmail(playerEmail, emailSubject, emailBody),
            sendEmail(doctorEmail, emailSubject, emailBody)
        ]);

        res.status(201).json(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
async function sendEmail(to, subject, body) {
    if (!to || !to.trim()) {
        console.error('Aucun destinataire défini.');
        return; // Arrêter l'exécution si aucun destinataire n'est défini
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'nour.baatour123@gmail.com', 
            pass: 'tczv wjla uxht bwxi' 
        }
    });

    const mailOptions = {
        from: 'nour.baatour123@gmail.com', 
        to,
        subject,
        html: `
            <html>
                <head>
                    <title>${subject}</title>
                </head>
                <body>
                    <p>${body}</p>
                </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail envoyé à ${to} avec succès.`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
        throw error; // Renvoyer l'erreur pour la gérer à un niveau supérieur si nécessaire
    }
}

function generateJitsiMeetLink(name, date) {
    const jitsiMeetDomain = 'meet.jit.si';


    if (!name || !date) {
        console.error('Le nom ou la date de la réunion est manquant.');
        return null;
    }

    const roomName = name.replace(/\s+/g, '-').toLowerCase();
    const formattedDate = date.toISOString();
    
    return `https://${jitsiMeetDomain}/${roomName}?date=${formattedDate}`;
}exports.cancelMeeting = async function(req, res) {
    const { meetingId } = req.params;

    try {
   
        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            return res.status(404).json({ message: 'Réunion non trouvée' });
        }

        await Meeting.findByIdAndDelete(meetingId);

        const participantsIds = meeting.participants.map(id => new mongoose.Types.ObjectId(id));
        const participantsString = participantsIds.map(id => id.toString());
        
        console.log("Identifiants des participants:", participantsString);
       
        const participantsEmails = await User.find({ _id: { $in: participantsString } }).distinct('email');
        
        console.log("Adresses e-mail des participants:", participantsEmails);

        const participants = await User.find({ email: { $in: participantsEmails } });
        
        console.log("Participants récupérés de la base de données:", participants);
        
        
        const emailSubject = 'Annulation de la réunion';
        const emailBody = `La réunion "${meeting.name}" prévue le ${meeting.date} a été annulée.`;

        await Promise.all(participants.map(async participant => {
            if (participant.email) {
                await sendEmail(participant.email, emailSubject, emailBody);
            }
        }));

       
        res.status(200).json({ message: 'Réunion annulée avec succès' });
    } catch (error) {
      
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.updateMeeting = async (req, res) => {
    const { meetingId } = req.params;
    const { meetingName, meetingDate, selectedPhysiotherapist, description } = req.body;
  
    try {
    
      const updatedMeeting = await Meeting.findByIdAndUpdate(meetingId, {
        meetingName,
        meetingDate,
        selectedPhysiotherapist,
        description
      }, { new: true });
  
     
      const physiotherapist = await Physiotherapist.findById(selectedPhysiotherapist);
  
   
      if (physiotherapist) {
        const notificationData = {
          recipient: physiotherapist.email,
          subject: 'Modification de réunion',
          body: `La réunion "${meetingName}" a été modifiée pour le ${meetingDate}.`
        };
        NotificationService.sendNotification(notificationData);
      } else {
        console.warn(`Physiothérapeute avec l'ID ${selectedPhysiotherapist} non trouvé.`);
      }
  
  
      res.status(200).json(updatedMeeting);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réunion:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la réunion. Veuillez réessayer.' });
    }
  };
  function generateConfirmationLink(meetingId) {
   
    return `http://localhost:3000/api/confirmMeeting/${meetingId}`;
} 

exports.confirmMeeting = async (req, res) => {
    const { meetingId } = req.params;

    try {
        const meeting = await Meeting.findById(meetingId);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Réunion non trouvée' });
        }

        if (meeting.confirmed) {
            return res.status(400).json({ message: 'La réunion est déjà confirmée' });
        }

        meeting.confirmed = true;
        await meeting.save();

        // Renvoyer une page HTML de confirmation
        res.status(200).send(`
            <html>
                <head>
                    <title>Confirmation de réunion</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            padding: 20px;
                        }
                        .success-message {
                            background-color: #4CAF50;
                            color: white;
                            padding: 10px;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-message">
                        Réunion confirmée avec succès !
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.getMeetingById = async (req, res) => {
    const { meetingId } = req.params;

    try {
        const meeting = await Meeting.findById(meetingId);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Réunion non trouvée' });
        }

        res.status(200).json(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.updateMeeting = async (req, res) => {
    const { id } = req.params;
    const { meetingDate } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: 'ID de la réunion manquant' });
        }

        const updatedMeeting = await Meeting.findByIdAndUpdate(id, { date: meetingDate }, { new: true });

        if (!updatedMeeting) {
            return res.status(404).json({ message: 'Réunion non trouvée' });
        }

        res.status(200).json({ message: 'Date de la réunion mise à jour avec succès', meeting: updatedMeeting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.sendEmail = sendEmail;
