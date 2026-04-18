function pickCandidate(source, candidates, fallback = undefined) {
    for (const candidate of candidates) {
        const value = typeof candidate === 'function' ? candidate(source) : source?.[candidate];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return fallback;
}

function firstArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function normalizeComparableId(value) {
    return String(value ?? '').trim().toLowerCase();
}

function toValidDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
    const date = toValidDate(value);
    if (!date) {
        return '--';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function extractOrderList(payload) {
    const base = payload?.data ?? payload ?? {};

    return firstArray(
        base.orders,
        base.items,
        base.results,
        base.data?.orders,
        base.data?.items,
        base.data?.results,
        base.list,
        base.data?.list,
    );
}

function getOrderItems(order) {
    return firstArray(
        order?.items,
        order?.orderItems,
        order?.details,
        order?.products,
        order?.data?.items,
    );
}

function normalizeOrderStatus(order) {
    const rawStatus = String(pickCandidate(order, [
        'status',
        'paymentStatus',
        (value) => value?.transaction?.status,
    ], '')).toLowerCase();

    if (rawStatus.includes('refund')) {
        return 'refunded';
    }

    if (rawStatus.includes('cancel')) {
        return 'cancelled';
    }

    if (rawStatus.includes('process')) {
        return 'processing';
    }

    if (rawStatus.includes('pending') || rawStatus.includes('wait')) {
        return 'pending';
    }

    return 'completed';
}

function itemMatchesCourse(item, courseId) {
    const normalizedCourseId = normalizeComparableId(courseId);
    const candidateIds = [
        item?.courseId,
        item?.subjectId,
        item?.itemId,
        item?.id,
        item?.course?.id,
        item?.subject?.id,
    ];

    return candidateIds.some((candidate) => normalizeComparableId(candidate) === normalizedCourseId);
}

function orderMatchesCourse(order, courseId) {
    const normalizedCourseId = normalizeComparableId(courseId);

    const directCandidates = [
        order?.courseId,
        order?.subjectId,
        order?.itemId,
        order?.course?.id,
        order?.subject?.id,
    ];

    if (directCandidates.some((candidate) => normalizeComparableId(candidate) === normalizedCourseId)) {
        return true;
    }

    return getOrderItems(order).some((item) => itemMatchesCourse(item, courseId));
}

function getItemTotal(item) {
    const quantity = Math.max(1, toNumber(item?.quantity, 1));
    const total = toNumber(item?.totalPrice ?? item?.finalAmount ?? item?.amount, NaN);

    if (Number.isFinite(total)) {
        return total;
    }

    return quantity * toNumber(item?.unitPrice ?? item?.price ?? item?.priceAmount, 0);
}

function getOrderCourseAmount(order, courseId) {
    const items = getOrderItems(order);

    if (items.length > 0) {
        const matchingItems = items.filter((item) => itemMatchesCourse(item, courseId));
        if (matchingItems.length === 0) {
            return 0;
        }

        const matchingGross = matchingItems.reduce((sum, item) => sum + getItemTotal(item), 0);
        const allGross = items.reduce((sum, item) => sum + getItemTotal(item), 0);
        const netAmount = toNumber(pickCandidate(order, [
            'finalAmount',
            'amount',
            'totalAmount',
            'paidAmount',
            (value) => value?.transaction?.amount,
        ], 0));

        if (allGross > 0 && netAmount > 0) {
            return Math.round((matchingGross / allGross) * netAmount);
        }

        return matchingGross;
    }

    if (!orderMatchesCourse(order, courseId)) {
        return 0;
    }

    return toNumber(pickCandidate(order, [
        'finalAmount',
        'amount',
        'totalAmount',
        'paidAmount',
        (value) => value?.transaction?.amount,
    ], 0));
}

function getOrderOccurredAt(order) {
    return pickCandidate(order, [
        'completedAt',
        'paidAt',
        'updatedAt',
        'createdAt',
        'created_at',
        (value) => value?.transaction?.createdAt,
    ], null);
}

function normalizeCourseOrder(order, courseId, index) {
    if (!orderMatchesCourse(order, courseId)) {
        return null;
    }

    const occurredAt = getOrderOccurredAt(order);
    const amount = getOrderCourseAmount(order, courseId);
    const status = normalizeOrderStatus(order);

    return {
        id: pickCandidate(order, ['displayCode', 'orderCode', 'code', 'id', '_id'], `ORD-${index + 1}`),
        studentId: pickCandidate(order, [
            (value) => value?.user?.id,
            (value) => value?.user?._id,
            'userId',
            'customerId',
            'studentId',
        ], ''),
        studentName: pickCandidate(order, [
            (value) => value?.user?.fullName,
            (value) => value?.user?.name,
            (value) => value?.customer?.fullName,
            (value) => value?.student?.fullName,
            'customerName',
            'userName',
            'studentName',
        ], 'Học viên'),
        studentEmail: pickCandidate(order, [
            (value) => value?.user?.email,
            (value) => value?.customer?.email,
            'customerEmail',
            'userEmail',
        ], ''),
        avatar: pickCandidate(order, [
            (value) => value?.user?.avatarUrl,
            (value) => value?.user?.avatar,
            (value) => value?.customer?.avatarUrl,
            (value) => value?.student?.avatarUrl,
        ], ''),
        amount,
        paymentMethod: String(pickCandidate(order, [
            'paymentMethod',
            (value) => value?.transaction?.paymentMethod,
        ], '')),
        status,
        createdAt: pickCandidate(order, ['createdAt', 'created_at'], occurredAt),
        occurredAt,
        dateLabel: formatDate(occurredAt ?? order?.createdAt ?? order?.created_at),
    };
}

export {
    extractOrderList,
    normalizeCourseOrder,
    normalizeComparableId,
    toNumber,
    toValidDate,
};
