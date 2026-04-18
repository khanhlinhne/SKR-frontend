import { useState } from 'react';

export default function useCurriculumDetailOverlays() {
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(null);
    const [showEditChapter, setShowEditChapter] = useState(null);
    const [showEditLesson, setShowEditLesson] = useState(null);
    const [showAddVideo, setShowAddVideo] = useState(null);
    const [showAddDocument, setShowAddDocument] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(null);
    const [showEditQuestion, setShowEditQuestion] = useState(null);
    const [showAssignmentBuilder, setShowAssignmentBuilder] = useState(null);
    const [showAddFlashcardCard, setShowAddFlashcardCard] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);

    return {
        showAddChapter,
        setShowAddChapter,
        showAddLesson,
        setShowAddLesson,
        showEditChapter,
        setShowEditChapter,
        showEditLesson,
        setShowEditLesson,
        showAddVideo,
        setShowAddVideo,
        showAddDocument,
        setShowAddDocument,
        showAddQuestion,
        setShowAddQuestion,
        showEditQuestion,
        setShowEditQuestion,
        showAssignmentBuilder,
        setShowAssignmentBuilder,
        showAddFlashcardCard,
        setShowAddFlashcardCard,
        previewVideo,
        setPreviewVideo,
        previewDocument,
        setPreviewDocument,
        previewQuestion,
        setPreviewQuestion,
    };
}
