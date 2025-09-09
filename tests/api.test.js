const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const SUPERADMIN_ID = Number(process.env.TEST_SUPERADMIN_ID || 1);
console.log('🧪 SUPERADMIN_ID:', SUPERADMIN_ID);

describe('API protected GET routes (with JWT)', () => {
  let authHeader;

  beforeAll(() => {
    const token = jwt.sign({ userId: SUPERADMIN_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authHeader = { Authorization: `Bearer ${token}` };
    console.log('🧪 authHeader:', authHeader);
  });

  it('GET /api/health should return success', async () => {
    const res = await request(app).get('/api/health')
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/health/protected should return success', async () => {
    const res = await request(app).get('/api/health/protected').set(authHeader);
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });


});


