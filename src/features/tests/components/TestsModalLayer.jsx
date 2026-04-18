import { OwlDialog } from '@/shared/ui/common';
import CreateTestModal from './CreateTestModal';

export default function TestsModalLayer({
    showCreateModal,
    onCloseCreate,
    onCreate,
    showEditModal,
    editingTestData,
    onCloseEdit,
    onUpdate,
    subjects,
    currentUserId,
    dialog,
    closeDialog,
    handleDialogConfirm,
}) {
    return (
        <>
            {showCreateModal && (
                <CreateTestModal
                    isOpen={showCreateModal}
                    onClose={onCloseCreate}
                    onCreate={onCreate}
                    subjects={subjects}
                    currentUserId={currentUserId}
                />
            )}

            {showEditModal && editingTestData && (
                <CreateTestModal
                    isOpen={showEditModal}
                    onClose={onCloseEdit}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    subjects={subjects}
                    currentUserId={currentUserId}
                    mode="edit"
                    initialTest={editingTestData}
                />
            )}

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onConfirm={handleDialogConfirm}
                onClose={closeDialog}
            />
        </>
    );
}
