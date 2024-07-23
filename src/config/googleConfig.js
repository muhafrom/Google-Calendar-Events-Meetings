import { google } from 'googleapis';

export const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

export const calendar = google.calendar({
    version: 'v3',
    auth: process.env.API_KEY,
});

export const scopes = ['https://www.googleapis.com/auth/calendar'];
