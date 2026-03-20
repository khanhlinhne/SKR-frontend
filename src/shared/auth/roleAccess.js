const ADMIN_ROLE_CODES = new Set(['admin', 'super_admin']);

function normalizeRoleCode(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function collectRoleCode(target, value) {
    const normalized = normalizeRoleCode(value);
    if (normalized) {
        target.push(normalized);
    }
}

function roleCodeFromObject(role) {
    if (!role || typeof role !== 'object') {
        return null;
    }

    return (
        role.roleCode ||
        role.role_code ||
        role.code ||
        role.name ||
        null
    );
}

export function extractRoleCodes(source) {
    if (!source || typeof source !== 'object') {
        return [];
    }

    const roleCodes = [];

    if (Array.isArray(source.roles)) {
        source.roles.forEach((role) => {
            if (typeof role === 'string') {
                collectRoleCode(roleCodes, role);
                return;
            }

            collectRoleCode(roleCodes, roleCodeFromObject(role));
        });
    }

    collectRoleCode(roleCodes, source.role);
    collectRoleCode(roleCodes, source.roleCode);
    collectRoleCode(roleCodes, source.role_code);

    return Array.from(new Set(roleCodes));
}

export function hasAdminRole(source) {
    const roleCodes = Array.isArray(source) ? source : extractRoleCodes(source);

    return roleCodes.some((roleCode) =>
        ADMIN_ROLE_CODES.has(String(roleCode).toLowerCase()),
    );
}

export function resolvePostLoginDestination(source, fallbackPath = '/dashboard') {
    return hasAdminRole(source) ? '/admin' : fallbackPath;
}
