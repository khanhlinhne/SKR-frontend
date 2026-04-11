import { useCallback, useState } from 'react';

const createInitialDialogState = () => ({
    isOpen: false,
    variant: 'info',
    title: '',
    message: '',
    details: '',
    confirmLabel: 'Đã hiểu',
    cancelLabel: 'Đóng',
    showCancel: false,
    confirmTone: 'primary',
    loading: false,
    onConfirm: null,
});

export default function useOwlDialog() {
    const [dialog, setDialog] = useState(createInitialDialogState);

    const closeDialog = useCallback(() => {
        setDialog(createInitialDialogState());
    }, []);

    const openDialog = useCallback((config) => {
        setDialog({
            ...createInitialDialogState(),
            isOpen: true,
            ...config,
        });
    }, []);

    const handleDialogConfirm = useCallback(async () => {
        const action = dialog.onConfirm;

        if (!action) {
            closeDialog();
            return;
        }

        setDialog((prev) => ({ ...prev, loading: true }));

        try {
            const shouldClose = await action();

            if (shouldClose === false) {
                setDialog((prev) => ({ ...prev, loading: false }));
                return;
            }

            closeDialog();
        } catch {
            setDialog((prev) => ({ ...prev, loading: false }));
        }
    }, [closeDialog, dialog.onConfirm]);

    return {
        dialog,
        openDialog,
        closeDialog,
        handleDialogConfirm,
    };
}
