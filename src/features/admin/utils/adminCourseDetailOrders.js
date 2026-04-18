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
        Array.isArray(base) ? base : null,
        base.orders,
        base.items,
        base.rows,
        base.records,
        base.documents,
        base.results,
        base.data,
        base.data?.orders,
        base.data?.items,
        base.data?.rows,
        base.data?.records,
        base.data?.documents,
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
        'payment_state',
        (value) => value?.transaction?.status,
    ], '')).toLowerCase();

    if (order?.isCompleted === true || order?.paid === true || order?.isPaid === true) {
        return 'completed';
    }

    if (order?.isCompleted === false || order?.paid === false || order?.isPaid === false) {
        return 'pending';
    }

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

    if (rawStatus.includes('success') || rawStatus.includes('paid') || rawStatus.includes('complete')) {
        return 'completed';
    }

    return 'completed';
}

function getCourseCandidates(courseRef) {
    if (courseRef && typeof courseRef === 'object') {
        return {
            id: normalizeComparableId(
                courseRef.id
                ?? courseRef.courseId
                ?? courseRef.subjectId
                ?? courseRef._id
                ?? '',
            ),
            code: normalizeComparableId(
                courseRef.subjectCode
                ?? courseRef.courseCode
                ?? courseRef.code
                ?? '',
            ),
            name: normalizeComparableId(
                courseRef.name
                ?? courseRef.courseName
                ?? courseRef.subjectName
                ?? courseRef.title
                ?? '',
            ),
        };
    }

    return {
        id: normalizeComparableId(courseRef),
        code: '',
        name: '',
    };
}

function itemMatchesCourse(item, courseRef) {
    const candidates = getCourseCandidates(courseRef);
    const candidateIds = [
        item?.courseId,
        item?.subjectId,
        item?.itemId,
        item?.id,
        item?.courseCode,
        item?.subjectCode,
        item?.code,
        item?.course?.id,
        item?.subject?.id,
        item?.course?.courseId,
        item?.subject?.subjectId,
        item?.course?.courseCode,
        item?.subject?.subjectCode,
        item?.course?.name,
        item?.course?.courseName,
        item?.subject?.name,
        item?.subject?.subjectName,
        item?.name,
        item?.title,
        item?.itemName,
    ];

    return candidateIds.some((candidate) => {
        const normalized = normalizeComparableId(candidate);
        return Boolean(normalized) && (
            normalized === candidates.id
            || normalized === candidates.code
            || normalized === candidates.name
        );
    });
}

function orderMatchesCourse(order, courseRef) {
    const candidates = getCourseCandidates(courseRef);

    const directCandidates = [
        order?.courseId,
        order?.subjectId,
        order?.itemId,
        order?.courseCode,
        order?.subjectCode,
        order?.courseName,
        order?.subjectName,
        order?.itemName,
        order?.courseTitle,
        order?.subjectTitle,
        order?.course?.id,
        order?.subject?.id,
        order?.course?.courseId,
        order?.subject?.subjectId,
        order?.course?.courseCode,
        order?.subject?.subjectCode,
        order?.course?.name,
        order?.course?.courseName,
        order?.subject?.name,
        order?.subject?.subjectName,
        order?.metadata?.courseId,
        order?.metadata?.subjectId,
        order?.metadata?.courseCode,
        order?.metadata?.subjectCode,
        order?.metadata?.courseName,
        order?.metadata?.subjectName,
        order?.data?.courseId,
        order?.data?.subjectId,
        order?.data?.courseCode,
        order?.data?.subjectCode,
        order?.data?.courseName,
        order?.data?.subjectName,
    ];

    if (directCandidates.some((candidate) => {
        const normalized = normalizeComparableId(candidate);
        return Boolean(normalized) && (
            normalized === candidates.id
            || normalized === candidates.code
            || normalized === candidates.name
        );
    })) {
        return true;
    }

    return getOrderItems(order).some((item) => itemMatchesCourse(item, courseRef));
}

function getItemTotal(item) {
    const quantity = Math.max(1, toNumber(item?.quantity, 1));
    const total = toNumber(item?.totalPrice ?? item?.finalAmount ?? item?.amount, NaN);

    if (Number.isFinite(total)) {
        return total;
    }

    return quantity * toNumber(item?.unitPrice ?? item?.price ?? item?.priceAmount, 0);
}

function getOrderCourseAmount(order, courseRef) {
    const items = getOrderItems(order);

    if (items.length > 0) {
        const matchingItems = items.filter((item) => itemMatchesCourse(item, courseRef));
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

    if (!orderMatchesCourse(order, courseRef)) {
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
        'completed_at',
        'completedAtUtc',
        'paidAt',
        'paid_at',
        'paidAtUtc',
        'paymentDate',
        'payment_date',
        'paymentCompletedAt',
        'paymentCompletedAtUtc',
        'purchasedAt',
        'purchased_at',
        'purchaseDate',
        'purchase_date',
        'orderedAt',
        'ordered_at',
        'orderDate',
        'order_date',
        'createdAtUtc',
        'updatedAt',
        'updated_at',
        'updatedAtUtc',
        'createdAt',
        'created_at',
        'date',
        (value) => value?.transaction?.createdAt,
        (value) => value?.transaction?.createdAtUtc,
        (value) => value?.transaction?.paidAt,
        (value) => value?.transaction?.paidAtUtc,
    ], null);
}

function normalizeCourseOrder(order, courseRef, index) {
    if (!orderMatchesCourse(order, courseRef)) {
        return null;
    }

    const occurredAt = getOrderOccurredAt(order);
    const amount = getOrderCourseAmount(order, courseRef);
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

function normalizeScopedCourseOrder(order, index) {
    if (!order) {
        return null;
    }

    const occurredAt = getOrderOccurredAt(order);
    const amount = toNumber(pickCandidate(order, [
        'courseAmount',
        'amount',
        'finalAmount',
        'totalAmount',
        'paidAmount',
        'priceAmount',
        'revenue',
        'grossRevenue',
        'netAmount',
        (value) => value?.transaction?.amount,
    ], 0));
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
            'fullName',
        ], 'Học viên'),
        studentEmail: pickCandidate(order, [
            (value) => value?.user?.email,
            (value) => value?.customer?.email,
            'customerEmail',
            'userEmail',
            'email',
        ], ''),
        avatar: pickCandidate(order, [
            (value) => value?.user?.avatarUrl,
            (value) => value?.user?.avatar,
            (value) => value?.customer?.avatarUrl,
            (value) => value?.student?.avatarUrl,
            'avatarUrl',
            'avatar',
        ], ''),
        amount,
        paymentMethod: String(pickCandidate(order, [
            'paymentMethod',
            (value) => value?.transaction?.paymentMethod,
        ], '')),
        status,
        createdAt: pickCandidate(order, ['createdAt', 'created_at', 'createdAtUtc', 'orderDate', 'purchasedAt', 'paymentDate'], occurredAt),
        occurredAt,
        dateLabel: formatDate(
            occurredAt
            ?? order?.createdAt
            ?? order?.created_at
            ?? order?.createdAtUtc
            ?? order?.orderDate
            ?? order?.purchasedAt
            ?? order?.paymentDate,
        ),
    };
}

export {
    extractOrderList,
    normalizeCourseOrder,
    normalizeScopedCourseOrder,
    normalizeComparableId,
    toNumber,
    toValidDate,
};
