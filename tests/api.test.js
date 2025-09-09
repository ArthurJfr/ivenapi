const request = require('supertest');
const app = require('../app');

describe('API basic routes', () => {
  it('GET /api/health should return success field (200 or 503 depending on services)', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/auth/is-connected without token should return isConnected false', async () => {
    const res = await request(app).get('/api/auth/is-connected');
    // backend renvoie 201 quand pas de token
    expect([200, 201, 401]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('isConnected');
    expect(res.body.isConnected).toBe(false);
  });
});


