import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';

describe('Game API Integration Tests', () => {
    let token: string;
    let userId: string;
    let gameId: string;

    beforeAll(async () => {
        const { user, token: userToken } = await createTestUser();
        token = userToken;
        userId = user._id.toString();
    });

    afterAll(async () => {
        await clearUsers();
        // Since we aren't mocking Game schema here we need to ensure tests don't pollute
    });

    describe('GET /api/v1/games', () => {
        test('should retrieve all games without auth', async () => {
            const res = await request(app).get('/api/v1/games');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.games)).toBe(true);
        });

        test('should execute search params properly', async () => {
            const res = await request(app).get('/api/v1/games?status=ongoing&sort=newest&limit=5');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should execute location filters directly', async () => {
            const res = await request(app).get('/api/v1/games?hasLocation=true');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/v1/games', () => {
        test('should require auth token to create a game', async () => {
            const res = await request(app)
                .post('/api/v1/games')
                .send({
                    title: 'Test Game Header',
                    description: 'Testing if creating a game relies on auth'
                });

            expect(res.statusCode).toBe(401);
        });

        test('should validate missing mandatory fields during game creation', async () => {
            const res = await request(app)
                .post('/api/v1/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'Description without a title or category'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        test('should register a new valid game request successfully', async () => {
            const res = await request(app)
                .post('/api/v1/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Ultimate Futsal Showdown',
                    description: 'Join us for a friendly match!',
                    tags: ['Futsal', 'friendly'],
                    maxPlayers: 10,
                    endTime: new Date(Date.now() + 86400000).toISOString(),
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();

            gameId = res.body.data._id; // Store for later tests
        });
    });

    describe('GET /api/v1/games/:id', () => {
        test('should fetch game details successfully', async () => {
            const res = await request(app)
                .get(`/api/v1/games/${gameId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(gameId);
            expect(res.body.data.title).toBe('Ultimate Futsal Showdown');
        });

        test('should gracefully handle unfound invalid games', async () => {
            const res = await request(app)
                .get(`/api/v1/games/654321098765432109876543`); // Invalid ID

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PATCH /api/v1/games/:id', () => {
        test('should reject unauthorized modifiers', async () => {
            const { token: otherToken } = await createTestUser({ email: 'intruder@example.com' });

            const res = await request(app)
                .patch(`/api/v1/games/${gameId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ maxPlayers: 15 });

            expect(res.statusCode).toBe(403); // Forbidden
            expect(res.body.success).toBe(false);
        });

        test('should allow proper host to modify fields', async () => {
            const res = await request(app)
                .patch(`/api/v1/games/${gameId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ maxPlayers: 14 });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.maxPlayers).toBe(14);
        });
    });

    describe('POST /api/v1/games/:id/join', () => {
        let joinToken: string;

        beforeAll(async () => {
            const { token: jToken } = await createTestUser({ email: 'joiner@example.com' });
            joinToken = jToken;
        });

        test('should reject unauthorized joins', async () => {
            const res = await request(app)
                .post(`/api/v1/games/${gameId}/join`);

            expect(res.statusCode).toBe(401);
        });

        test('should allow a new user to join the lobby successfully', async () => {
            const res = await request(app)
                .post(`/api/v1/games/${gameId}/join`)
                .set('Authorization', `Bearer ${joinToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.message).toMatch(/joined/i);
        });

        test('should reject duplicate joins', async () => {
            const res = await request(app)
                .post(`/api/v1/games/${gameId}/join`)
                .set('Authorization', `Bearer ${joinToken}`);

            expect(res.statusCode).toBe(400); // Already joined mapping
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/games/:id/leave', () => {
        let leaveToken: string;

        beforeAll(async () => {
            const { token: lToken } = await createTestUser({ email: 'leaver@example.com' });
            leaveToken = lToken;

            // First join so we can leave
            await request(app)
                .post(`/api/v1/games/${gameId}/join`)
                .set('Authorization', `Bearer ${leaveToken}`);
        });

        test('should process a user leaving the lobby successfully', async () => {
            const res = await request(app)
                .post(`/api/v1/games/${gameId}/leave`)
                .set('Authorization', `Bearer ${leaveToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.message).toMatch(/left/i);
        });
    });

    describe('DELETE /api/v1/games/:id', () => {
        let delGameId: string;

        beforeAll(async () => {
            // Create a temp game to delete
            const gameRes = await request(app)
                .post('/api/v1/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Deletion target',
                    tags: ['Futsal', 'target'],
                    maxPlayers: 5,
                    endTime: new Date(Date.now() + 86400000).toISOString(),
                });
            delGameId = gameRes.body.data._id;
        });
    });
});
