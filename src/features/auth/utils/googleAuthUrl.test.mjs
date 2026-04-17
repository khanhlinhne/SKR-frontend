import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGoogleAuthUrl } from './googleAuthUrl.js';

test('buildGoogleAuthUrl keeps the /api prefix for the Google OAuth endpoint', () => {
    assert.equal(
        buildGoogleAuthUrl('http://localhost:5000/api'),
        'http://localhost:5000/api/auth/google',
    );
});

test('buildGoogleAuthUrl includes a safe redirect target in the query string', () => {
    assert.equal(
        buildGoogleAuthUrl('http://localhost:5000/api', '/checkout'),
        'http://localhost:5000/api/auth/google?redirect=%2Fcheckout',
    );
});

test('buildGoogleAuthUrl ignores unsafe redirect values', () => {
    assert.equal(
        buildGoogleAuthUrl('http://localhost:5000/api', 'https://malicious.example'),
        'http://localhost:5000/api/auth/google',
    );
});
