import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCurriculumDetailFeedback() {
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const toastTimeoutRef = useRef(null);
    const confirmResolverRef = useRef(null);

    const showToast = useCallback((payload, type = 'success') => {
        const toastPayload = typeof payload === 'string'
            ? { message: payload, type }
            : { ...payload, type: payload?.type || type };

        const resolvedType = toastPayload.type || type;
        const resolvedTitle = toastPayload.title || (
            resolvedType === 'error'
                ? 'Không xử lý được thao tác này'
                : 'Đã cập nhật giáo trình'
        );

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({
            ...toastPayload,
            type: resolvedType,
            title: resolvedTitle,
            message: toastPayload.message || '',
        });

        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4200);
    }, []);

    const dismissToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
        setToast(null);
    }, []);

    const requestConfirmation = useCallback((options) => (
        new Promise((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmDialog({
                tone: 'danger',
                cancelLabel: 'Giữ lại',
                confirmLabel: 'Xác nhận',
                hint: 'Thay đổi này sẽ áp dụng ngay lên giáo trình bạn đang biên soạn.',
                ...options,
            });
        })
    ), []);

    const resolveConfirmation = useCallback((result) => {
        setConfirmDialog(null);
        if (confirmResolverRef.current) {
            confirmResolverRef.current(result);
            confirmResolverRef.current = null;
        }
    }, []);

    useEffect(() => () => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        if (confirmResolverRef.current) {
            confirmResolverRef.current(false);
            confirmResolverRef.current = null;
        }
    }, []);

    return {
        toast,
        confirmDialog,
        showToast,
        dismissToast,
        requestConfirmation,
        resolveConfirmation,
    };
}
