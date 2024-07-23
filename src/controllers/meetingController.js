import { oauth2Client, scopes } from '../config/googleConfig.js';
import { scheduleEvent, scheduleMeeting } from '../services/meetingService.js';

export const googleAuth = (req, res) => {
    const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
    return res.redirect(url);
};

export const googleAuthRedirect = async (req, res) => {
    const code = req.query.code;
    if (code) {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return res.send({ message: 'Successfully authenticated' });
    } else {
        return res.status(400).send({ message: req.query.error || 'No code returned by Google' });
    }
};

export const scheduleEventHandler = async (req, res) => {
    try {
        const eventLink = await scheduleEvent(req.body);
        res.status(200).json({ eventLink });
    } catch (error) {
        res.status(500).send('Error creating event');
    }
};

export const scheduleMeetingHandler = async (req, res) => {
    try {
        const eventLink = await scheduleMeeting(req.body);
        res.status(200).json({ eventLink });
    } catch (error) {
        res.status(500).send('Error creating event');
    }
};
