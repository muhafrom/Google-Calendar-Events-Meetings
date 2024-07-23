import { calendar, oauth2Client } from '../config/googleConfig.js';
import { v4 as uuid } from 'uuid';

export const scheduleEvent = async ({ summary, description, start, end, attendees }) => {
    const event = {
        summary: summary || 'New Event',
        location: 'Online',
        description: description || 'Description of the event.',
        start: { dateTime: start, timeZone: 'GB' },
        end: { dateTime: end, timeZone: 'GB' },
        attendees: attendees.map(email => ({ email })),
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
        attendees: attendees.map(email => ({ email, responseStatus: 'needsAction' })),
    };

    return new Promise((resolve, reject) => {
        calendar.events.insert(
            { calendarId: 'primary', auth: oauth2Client, resource: event, sendNotifications: true },
            (err, event) => {
                if (err) {
                    console.error('There was an error contacting the Calendar service: ' + err);
                    reject('Error creating event');
                }
                resolve(event.data.htmlLink);
            }
        );
    });
};

export const scheduleMeeting = async ({ summary, description, start, end, attendees }) => {
    const event = {
        summary: summary || 'Google Meet Meeting',
        location: 'Online',
        description: description || 'A chance to talk with friends.',
        start: { dateTime: start, timeZone: 'GB' },
        end: { dateTime: end, timeZone: 'GB' },
        attendees: attendees.map(email => ({ email })),
        conferenceData: {
            createRequest: {
                requestId: uuid(),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
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

    return new Promise((resolve, reject) => {
        calendar.events.insert(
            { calendarId: 'primary', auth: oauth2Client, resource: event, sendNotifications: true, conferenceDataVersion: 1 },
            (err, event) => {
                if (err) {
                    console.error('There was an error contacting the Calendar service: ' + err);
                    reject('Error creating event');
                }
                resolve(event.data.htmlLink);
            }
        );
    });
};
