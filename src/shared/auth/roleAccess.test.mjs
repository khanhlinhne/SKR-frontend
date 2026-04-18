import test from 'node:test';
import assert from 'node:assert/strict';

import {
    extractRoleCodes,
    hasAdminRole,
    hasExpertRole,
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

test('hasExpertRole accepts creator and expert variants', () => {
    assert.equal(hasExpertRole(['creator']), true);
    assert.equal(hasExpertRole(['CREATOR']), true);
    assert.equal(hasExpertRole(['expert']), true);
    assert.equal(hasExpertRole(['learner']), false);
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

test('resolvePostLoginDestination routes creator users to expert dashboard', () => {
    assert.equal(
        resolvePostLoginDestination({ roles: ['creator'] }),
        '/expert',
    );
    assert.equal(
        resolvePostLoginDestination({ role: 'CREATOR' }),
        '/expert',
    );
});

test('resolvePostLoginDestination: admin takes priority over creator', () => {
    assert.equal(
        resolvePostLoginDestination({ roles: ['admin', 'creator'] }),
        '/admin',
    );
});
