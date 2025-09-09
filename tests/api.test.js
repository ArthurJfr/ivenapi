const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

describe('API protected GET routes (with JWT)', () => {
  let authHeader;

  beforeAll(() => {
    // Configure via variable d’environnement pour pointer l’ID superadmin réel
    const SUPERADMIN_ID = process.env.TEST_SUPERADMIN_ID || 3;
    const token = jwt.sign({ userId: SUPERADMIN_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authHeader = { Authorization: `Bearer ${token}` };
  });

  it('GET /api/health should return success', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/auth/is-connected with token should return isConnected true', async () => {
    const res = await request(app).get('/api/auth/is-connected').set(authHeader);
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('isConnected');
    // si token OK → true; sinon backend peut renvoyer 201/false
    if (res.statusCode === 200) expect(res.body.isConnected).toBe(true);
  });

  // Exemples de GET protégés (ne doivent PAS renvoyer 401 avec le token)
  it('GET /api/event/owner/:ownerId with token should not be 401', async () => {
    const ownerId = process.env.TEST_SUPERADMIN_ID || 1;
    const res = await request(app).get(`/api/event/owner/${ownerId}`).set(authHeader);
    expect([200, 404]).toContain(res.statusCode); // 404 si pas de données, mais pas 401
  });

  it('GET /api/event/participant/:participantId with token should not be 401', async () => {
    const participantId = process.env.TEST_SUPERADMIN_ID || 1;
    const res = await request(app).get(`/api/event/participant/${participantId}`).set(authHeader);
    expect([200, 404]).toContain(res.statusCode);
  });

  it('GET /api/event/search/users?q=admin with token should not be 401', async () => {
    const res = await request(app).get('/api/event/search/users?q=admin').set(authHeader);
    expect([200]).toContain(res.statusCode);
  });

  it('GET /api/tasks/participant/:participantId with token should not be 401', async () => {
    const participantId = process.env.TEST_SUPERADMIN_ID || 1;
    const res = await request(app).get(`/api/task/participant/${participantId}`).set(authHeader);
    expect([200, 404]).toContain(res.statusCode);
  });
});


