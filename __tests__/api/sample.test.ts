import request from 'supertest';
import app from '../../src/app';
import { describe, it, expect } from '@jest/globals';

describe('API Route Testing', () => {
    it('Should return 200 OK from the root endpoint', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('PlaySync API running');
    });

    it('Should handle unknown routes with a 404/500 style approach (Depending on how the server is setup)', async () => {
        const response = await request(app).get('/api/unknown-route');

        // Asserting based on how your app handles missing routes (often HTML or a JSON format)
        // Express usually returns 404 HTML for unhandled routes
        expect(response.status).toBe(404);
    });
});
