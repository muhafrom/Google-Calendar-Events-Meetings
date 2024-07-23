import dotenv from 'dotenv/config';
import express from 'express';
import { google } from 'googleapis';
import { v4 as uuid } from 'uuid';

const calendar = google.calendar({
    version: 'v3',
    auth: process.env.API_KEY,

})

const app = express();

const PORT = process.env.NODE_ENV | 5000;

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    // Log all info 
    res.on("finish", () => {
        console.info(
            `${new Date().toISOString()} Finished ${req.method} ${req.originalUrl
            } status ${res.statusCode} ${res.get("content-length")} - ${req.get(
                "user-agent"
            )} ${req.ip}`
        );

    })
    next();
})

app.get('/googleAuth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    return res.redirect(url)
});

app.get('/googleAuth/redirect', async (req, res) => {
    const code = req.query.code;
    if (code) {
        // Use the code to get the access token, then use the access token to access the user's data
        const { tokens } = await oauth2Client.getToken(code);
        console.log(tokens)
        oauth2Client.setCredentials(tokens);
        return res.send({ message: 'Successfully authenticated' });
    } else {
        if (req.query.error) {
            // The user did not give us permission or config issue
            console.error('Error getting oAuth tokens:');
            console.error(req.query.error);
            return res.status(400).send({ message: 'User did not give us permission or config issue' });
        }
        // No code was returned by Google. This could be due to the user denying the authorization request, or some other error.
        return res.status(400).send({ message: 'No code returned by Google' });
    }
});

app.post('/schedule_event', async (req, res) => {
    const { summary, description, start, end, attendees } = req.body;

    const event = {
        summary: summary || 'New Event',
        location: 'Online',
        description: description || 'Description of the event.',
        start: {
            dateTime: start,
            timeZone: 'GB',
        },
        end: {
            dateTime: end,
            timeZone: 'GB',
        },
        attendees: attendees.map(email => ({ email })),
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
        attendees: attendees.map(email => ({
            email,
            responseStatus: 'needsAction', // Attendees will receive an invitation email
        })),
    };

    calendar.events.insert(
        {
            calendarId: 'primary',
            auth: oauth2Client,
            resource: event,
            sendNotifications: true
        },
        (err, event) => {
            if (err) {
                console.error('There was an error contacting the Calendar service: ' + err);
                res.status(500).send('Error creating event');
                return;
            }
            console.log('Event created: %s', event.data.htmlLink);
            res.status(200).json({ eventLink: event.data.htmlLink });
        }
    );
});

app.post('/schedule_meeting', async (req, res) => {
    const { summary, description, start, end, attendees } = req.body;

    const event = {
        summary: summary || 'Google Meet Meeting',
        location: 'Online',
        description: description || 'A chance to talk with friends.',
        start: {
          dateTime: start,
          timeZone: 'GB',
        },
        end: {
          dateTime: end,
          timeZone: 'GB',
        },
        attendees: attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: 'sample123', // Unique ID for the request
            conferenceSolutionKey: { type: 'hangoutsMeet' }, // Specifies Google Meet
            status: { statusCode: 'success' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

    calendar.events.insert(
        {
            calendarId: 'primary',
            auth: oauth2Client,
            resource: event,
            sendNotifications: true,
            conferenceDataVersion: 1, // Required to enable Google Meet
        },
        (err, event) => {
            if (err) {
                console.error('There was an error contacting the Calendar service: ' + err);
                res.status(500).send('Error creating event');
                return;
            }
            console.log('Event created: %s', event.data.htmlLink);
            res.status(200).json({ eventLink: event.data.htmlLink });
        }
    );
});

// Error handling
app.use((err, req, res, _next) => {
    console.error("_______________")
    console.error(">>>>>>>>>>>", err.stack);
    console.error("_______________")
    return res.status(500).send({ message: 'Internal Server Error' });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});