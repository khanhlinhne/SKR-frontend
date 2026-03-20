import test from 'node:test';
import assert from 'node:assert/strict';

import {
    extractRoleCodes,
    hasAdminRole,
    resolvePostLoginDestination,
} from './roleAccess.js';

test('extractRoleCodes supports roles array and singular role fields', () => {
    assert.deepEqual(
        extractRoleCodes({
            roles: [{ roleCode: 'premium_user' }, 'ADMIN'],
        }),
        ['premium_user', 'ADMIN'],
    );

    assert.deepEqual(
        extractRoleCodes({
            role: 'admin',
        }),
        ['admin'],
    );
});

test('hasAdminRole accepts case variants and super_admin', () => {
    assert.equal(hasAdminRole(['ADMIN']), true);
    assert.equal(hasAdminRole(['super_admin']), true);
    assert.equal(hasAdminRole(['premium_user']), false);
});

test('resolvePostLoginDestination routes admin users to admin dashboard', () => {
    assert.equal(
        resolvePostLoginDestination({ roles: ['admin'] }),
        '/admin',
    );
    assert.equal(
        resolvePostLoginDestination({ role: 'ADMIN' }),
        '/admin',
    );
    assert.equal(
        resolvePostLoginDestination({ roles: ['learner'] }),
        '/dashboard',
    );
});
