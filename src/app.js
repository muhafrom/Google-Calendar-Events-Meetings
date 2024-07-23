import dotenv from 'dotenv/config';
import express from 'express';
import { googleAuth, googleAuthRedirect, scheduleEventHandler, scheduleMeetingHandler } from './controllers/meetingController.js';
import { logger } from './middlewares/logger.js';

const app = express();
const PORT = process.env.NODE_ENV | 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/googleAuth', googleAuth);
app.get('/googleAuth/redirect', googleAuthRedirect);
app.post('/schedule_event', scheduleEventHandler);
app.post('/schedule_meeting', scheduleMeetingHandler);

app.use((err, req, res, _next) => {
    console.error("_______________");
    console.error(">>>>>>>>>>>", err.stack);
    console.error("_______________");
    return res.status(500).send({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
