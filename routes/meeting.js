const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');

//router.post('/scheduleMeeting', meetingController.scheduleMeeting);

//router.delete('/cancelMeeting/:meetingId', meetingController.cancelMeeting);

router.put('/updateMeeting/:meetingId', meetingController.updateMeeting);

//router.get('/physiotherapists', meetingController.getPhysiotherapists);

//router.get('/meetings', meetingController.getMeetings);

const { getPhysiotherapists, getMeetings, scheduleMeeting ,confirmMeeting,getPlayers,scheduleMeetingWithDoctor} = require('../controllers/meetingController');

router.get('/physiotherapists', getPhysiotherapists);
router.get('/players', getPlayers);
router.get('/doctors', meetingController.getDoctors);
router.get('/meetings', getMeetings);
router.post('/schedule-meeting', scheduleMeeting);
router.delete('/cancel-meeting/:meetingId', meetingController.cancelMeeting);
router.put('/update-meeting/:meetingId', meetingController.cancelMeeting);
//router.get('/confirm-meeting/:meetingId', meetingController.confirmMeeting); 
router.post('/confirmMeeting/:meetingId', meetingController.confirmMeeting);
router.get('/meeting/:meetingId', meetingController.getMeetingById);
router.get('/confirmMeeting/:meetingId', meetingController.confirmMeeting); 
router.get('/meetings/player/:playerId', meetingController.getMeetingsByPlayerId);
router.post('/schedule-meetingwithdoctor', meetingController.scheduleMeetingWithDoctor);
router.put('/meetings-update/:id', meetingController.updateMeeting);
module.exports = router;
