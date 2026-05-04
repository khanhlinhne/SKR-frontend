import courseApi from '@/shared/api/courseApi';
import { assignmentApi, flashcardApi } from '@/shared/api';
import {
    formatDurationMinutes,
    getFlashcardSetItems,
    getLessonDurationMinutes,
    getLessonFlashcardSets,
    validateLessonForm,
} from '@/features/expert/components/curriculum-detail/curriculumDetailUtils';

function shouldFallbackQuestionUpdate(error) {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();

    return status === 404 || message.includes('route not found');
}

function shouldUseAssignmentReadFallback(error) {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();

    return !status || status === 404 || status >= 500 || message.includes('route not found');
}

export default function useCurriculumMutations(deps) {
    const {
        courseId,
        chapters,
        showAddLesson,
        showEditChapter,
        showEditLesson,
        showAddVideo,
        showAddDocument,
        showAddQuestion,
        showEditQuestion,
        showAssignmentBuilder,
        showAddFlashcardCard,
        selectedLesson,
        quizTimeLimitDraft,
        showToast,
        requestConfirmation,
        fetchCourseData,
        getChapterLessons,
        getLessonById,
        getResolvedLessonType,
        setLoadingContent,
        setSaving,
        setChapters,
        setSelectedLesson,
        setLessonContent,
        setLessonTypeOverrides,
        setShowAddChapter,
        setShowAddLesson,
        setShowEditChapter,
        setShowEditLesson,
        setShowAddVideo,
        setShowAddDocument,
        setShowAddQuestion,
        setShowEditQuestion,
        setShowAssignmentBuilder,
        setShowAddFlashcardCard,
    } = deps;

    const createFlashcardSetForLesson = async ({ lessonId, lessonName }) => {
        const response = await flashcardApi.createSet({
            setTitle: `${lessonName} - Flashcard`,
            setDescription: `Bo flashcard cho bai giang "${lessonName}"`,
            lessonId,
            courseId,
            visibility: 'premium_only',
            status: 'active',
            tags: ['lesson-flashcard'],
        });

        const payload = response?.data?.data || response?.data || response;
        return payload?.flashcardSetId || payload?.id || null;
    };

    const hydrateLessonFlashcardSets = async (sets = []) => {
        if (!Array.isArray(sets) || sets.length === 0) {
            return [];
        }

        return Promise.all(sets.map(async (set) => {
            const existingItems = getFlashcardSetItems(set);
            if (existingItems.length > 0) {
                return { ...set, items: existingItems };
            }

            const setId = set?.flashcardSetId || set?.id;
            if (!setId) {
                return { ...set, items: existingItems };
            }

            try {
                const detailResponse = await flashcardApi.getSetById(setId);
                const detailPayload = detailResponse?.data || detailResponse || {};
                const detailItems = getFlashcardSetItems(detailPayload);

                return {
                    ...set,
                    ...detailPayload,
                    items: detailItems,
                };
            } catch (err) {
                console.error('Failed to hydrate flashcard set details:', err);
                return { ...set, items: existingItems };
            }
        }));
    };

    const loadLessonContent = async (chapterId, lessonId, lesson = null) => {
        const lessonMeta = lesson || getLessonById(chapterId, lessonId);
        const resolvedLessonType = getResolvedLessonType(lessonMeta);

        setSelectedLesson({ chapterId, lessonId });
        setLoadingContent?.(true);
        try {
            const res = await courseApi.getLessonContent(courseId, chapterId, lessonId);
            const content = res?.data || res;
            const flashcardSets = await hydrateLessonFlashcardSets(getLessonFlashcardSets(content));
            let assignment = null;
            if (resolvedLessonType === 'assignment') {
                try {
                    assignment = await assignmentApi.getLessonAssignment(courseId, chapterId, lessonId);
                } catch (assignmentError) {
                    console.warn('Failed to reload assignment detail after loading lesson content:', assignmentError);
                    if (!shouldUseAssignmentReadFallback(assignmentError)) {
                        throw assignmentError;
                    }
                }
            }
            const durationMinutes = getLessonDurationMinutes(content) || getLessonDurationMinutes(lessonMeta);

            if (resolvedLessonType === 'flashcard' || flashcardSets.length > 0) {
                setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            }
            if (assignment?.assignmentId || assignment?.title) {
                setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'assignment' }));
            }

            setLessonContent({
                ...content,
                estimatedDurationMinutes: durationMinutes,
                timeLimitMinutes: durationMinutes,
                flashcardSets,
                assignment,
                lessonType: flashcardSets.length > 0 ? 'flashcard' : (assignment ? 'assignment' : resolvedLessonType),
            });
        } catch (contentError) {
            const fallbackDurationMinutes = getLessonDurationMinutes(lessonMeta);
            let assignment = null;
            if (resolvedLessonType === 'assignment') {
                try {
                    assignment = await assignmentApi.getLessonAssignment(courseId, chapterId, lessonId);
                } catch (assignmentError) {
                    console.warn('Failed to load assignment fallback state:', assignmentError);
                    if (!shouldUseAssignmentReadFallback(assignmentError)) {
                        throw contentError;
                    }
                }
            }
            setLessonContent({
                lessonType: assignment ? 'assignment' : resolvedLessonType,
                estimatedDurationMinutes: fallbackDurationMinutes,
                timeLimitMinutes: fallbackDurationMinutes,
                videos: [],
                documents: [],
                questions: [],
                flashcardSets: [],
                assignment,
            });
        } finally {
            setLoadingContent?.(false);
        }
    };

    const toggleLessonContent = async (chapterId, lessonId, lesson = null) => {
        const key = `${chapterId}-${lessonId}`;
        const currentKey = selectedLesson ? `${selectedLesson.chapterId}-${selectedLesson.lessonId}` : null;
        if (currentKey === key) {
            setSelectedLesson(null);
            setLessonContent(null);
            return;
        }

        await loadLessonContent(chapterId, lessonId, lesson);
    };

    const appendCreatedQuestionsToState = (chapterId, lessonId, createdQuestions = []) => {
        if (!Array.isArray(createdQuestions) || createdQuestions.length === 0) {
            return;
        }

        setChapters((prev) => prev.map((chapter) => {
            if ((chapter.chapterId || chapter.id) !== chapterId) {
                return chapter;
            }

            return {
                ...chapter,
                lessons: (chapter.lessons || []).map((lesson) => {
                    if ((lesson.lessonId || lesson.id) !== lessonId) {
                        return lesson;
                    }

                    const currentTotalQuestions = Number(lesson.totalQuestions ?? 0);
                    return {
                        ...lesson,
                        totalQuestions: currentTotalQuestions + createdQuestions.length,
                    };
                }),
            };
        }));

        setLessonContent((prev) => {
            if (!prev || selectedLesson?.chapterId !== chapterId || selectedLesson?.lessonId !== lessonId) {
                return prev;
            }

            const existingQuestions = Array.isArray(prev.questions) ? prev.questions : [];
            const currentTotalQuestions = Number(prev.totalQuestions ?? existingQuestions.length);

            return {
                ...prev,
                totalQuestions: currentTotalQuestions + createdQuestions.length,
                questions: [...createdQuestions.slice().reverse(), ...existingQuestions],
            };
        });
    };

    const handleAddChapter = async (form) => {
        setSaving(true);
        try {
            const payload = {
                chapterCode: form.chapterCode,
                chapterName: form.chapterName,
                chapterDescription: form.chapterDescription || undefined,
                displayOrder: chapters.length,
            };
            await courseApi.createChapter(courseId, payload);
            showToast({
                title: 'Da them chuong moi',
                message: `Chuong "${form.chapterName}" da san sang de ban them bai giang.`,
            });
            setShowAddChapter(false);
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chua the them chuong',
                message: err.response?.data?.message || 'Chuong moi chua duoc tao. Ban thu lai sau nhe.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChapter = async (chapter) => {
        const chapterId = chapter.chapterId || chapter.id;
        const confirmed = await requestConfirmation({
            badge: 'Xoa chuong',
            title: `Xoa chuong "${chapter.chapterName}"?`,
            description: 'Toan bo bai giang nam trong chuong nay cung se bi go khoi giao trinh.',
            confirmLabel: 'Xoa chuong',
            cancelLabel: 'Giu chuong nay',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteChapter(courseId, chapterId);
            showToast({
                title: 'Da xoa chuong',
                message: `Chuong "${chapter.chapterName}" da duoc go khoi giao trinh.`,
            });
            setChapters((prev) => prev.filter((item) => (item.chapterId || item.id) !== chapterId));
        } catch (err) {
            showToast({
                title: 'Chua the xoa chuong',
                message: err.response?.data?.message || 'Chuong nay chua duoc xoa. Ban thu lai nhe.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddLesson = async (form) => {
        const chapterId = showAddLesson;
        const existingLessons = getChapterLessons(chapterId);
        const validation = validateLessonForm(form, existingLessons);
        if (!validation.isValid) {
            showToast({
                title: 'Chua the tao bai giang',
                message: validation.summary,
            }, 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonDescription: '',
                displayOrder: getChapterLessons(chapterId).length,
                lessonType: form.lessonType,
            };

            const response = await courseApi.createLesson(courseId, chapterId, payload);
            const createdLesson = response?.data || response;
            const createdLessonId = createdLesson?.lessonId || createdLesson?.id || null;
            const shouldCreateFlashcardSet = form.lessonType === 'flashcard' && Boolean(createdLessonId);
            const shouldOpenLessonBuilder = Boolean(createdLessonId) && (
                form.lessonType === 'flashcard'
                || form.lessonType === 'quiz'
                || form.lessonType === 'assignment'
            );
            const optimisticLesson = {
                ...createdLesson,
                lessonId: createdLessonId,
                lessonCode: form.lessonCode,
                lessonName: form.lessonName,
                lessonType: form.lessonType,
                type: form.lessonType,
                totalFlashcardSets: shouldCreateFlashcardSet ? 1 : (createdLesson?.totalFlashcardSets || 0),
                hasFlashcardSet: shouldCreateFlashcardSet ? true : Boolean(createdLesson?.hasFlashcardSet),
                hasAssignment: form.lessonType === 'assignment' ? true : Boolean(createdLesson?.hasAssignment),
            };

            if (createdLessonId) {
                if (form.lessonType === 'assignment') {
                    try {
                        await courseApi.updateLesson(courseId, chapterId, createdLessonId, { lessonType: 'assignment' });
                    } catch {
                        // Keep frontend override path active on older backends.
                    }
                }

                setLessonTypeOverrides((prev) => ({ ...prev, [createdLessonId]: form.lessonType }));
                setChapters((prev) => prev.map((chapter) => {
                    const currentChapterId = chapter.chapterId || chapter.id;
                    if (currentChapterId !== chapterId) return chapter;

                    const chapterLessons = chapter.lessons || [];
                    const lessonExists = chapterLessons.some((lesson) => (lesson.lessonId || lesson.id) === createdLessonId);

                    return {
                        ...chapter,
                        lessons: lessonExists ? chapterLessons : [...chapterLessons, optimisticLesson],
                    };
                }));
            }

            if (shouldCreateFlashcardSet) {
                try {
                    await createFlashcardSetForLesson({ lessonId: createdLessonId, lessonName: form.lessonName });
                    showToast({
                        title: 'Da them bai giang moi',
                        message: `Bai "${form.lessonName}" da duoc tao kem mot bo flashcard.`,
                    });
                } catch (flashcardErr) {
                    showToast({
                        title: 'Bai giang da duoc tao',
                        message: flashcardErr.response?.data?.message || 'Bai giang da duoc tao nhung bo flashcard tu dong chua san sang.',
                    }, 'error');
                }
            } else if (form.lessonType === 'quiz') {
                showToast({
                    title: 'Da tao bai kiem tra moi',
                    message: `Bai "${form.lessonName}" da san sang de ban them cau hoi.`,
                });
            } else {
                showToast({
                    title: 'Da them bai giang moi',
                    message: `Bai "${form.lessonName}" da xuat hien trong chuong trinh hoc.`,
                });
            }

            setShowAddLesson(null);
            await fetchCourseData();

            if (shouldOpenLessonBuilder) {
                await loadLessonContent(chapterId, createdLessonId, optimisticLesson);
            }
            if (form.lessonType === 'quiz' && createdLessonId) {
                setShowAddQuestion({ chapterId, lessonId: createdLessonId });
            }
            if (form.lessonType === 'assignment' && createdLessonId) {
                setShowAssignmentBuilder({
                    chapterId,
                    lessonId: createdLessonId,
                    lessonName: form.lessonName,
                    initialValue: null,
                });
            }
        } catch (err) {
            showToast({
                title: 'Chua the them bai giang',
                message: err.response?.data?.message || 'Bai giang moi chua duoc tao. Ban thu lai nhe.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (chapterId, lesson) => {
        const lessonId = lesson.lessonId || lesson.id;
        const confirmed = await requestConfirmation({
            badge: 'Xoa bai giang',
            title: `Xoa bai "${lesson.lessonName}"?`,
            description: 'Bai giang nay se bi go khoi chuong hien tai.',
            confirmLabel: 'Xoa bai giang',
            cancelLabel: 'Giu bai nay',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteLesson(courseId, chapterId, lessonId);
            showToast({
                title: 'Da xoa bai giang',
                message: `Bai "${lesson.lessonName}" da duoc go khoi chuong trinh hoc.`,
            });
            setLessonTypeOverrides((prev) => {
                if (!prev[lessonId]) return prev;
                const next = { ...prev };
                delete next[lessonId];
                return next;
            });
            setChapters((prev) => prev.map((chapter) => {
                const currentChapterId = chapter.chapterId || chapter.id;
                if (currentChapterId !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: (chapter.lessons || []).filter((item) => (item.lessonId || item.id) !== lessonId),
                };
            }));
            if (selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lessonId) {
                setSelectedLesson(null);
                setLessonContent(null);
            }
        } catch (err) {
            showToast({
                title: 'Chua the xoa bai giang',
                message: err.response?.data?.message || 'Bai giang nay chua duoc xoa. Ban thu lai nhe.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEditChapter = async (form) => {
        const chapter = showEditChapter;
        const chapterId = chapter?.chapterId || chapter?.id;
        if (!chapterId) return;

        setSaving(true);
        try {
            await courseApi.updateChapter(courseId, chapterId, {
                chapterName: form.chapterName,
                chapterCode: form.chapterCode,
                chapterDescription: form.chapterDescription || undefined,
            });

            setChapters((prev) => prev.map((item) => (
                (item.chapterId || item.id) === chapterId
                    ? { ...item, chapterName: form.chapterName, chapterCode: form.chapterCode, chapterDescription: form.chapterDescription }
                    : item
            )));

            setShowEditChapter(null);
            showToast({
                title: 'Da cap nhat chuong',
                message: `Chuong "${form.chapterName}" da duoc luu thong tin moi.`,
            });
        } catch (err) {
            showToast({
                title: 'Chua the cap nhat chuong',
                message: err.response?.data?.message || 'Thong tin chuong chua duoc luu.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEditLesson = async (form) => {
        const chapterId = showEditLesson?.chapterId;
        const lesson = showEditLesson?.lesson;
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!chapterId || !lessonId) return;

        setSaving(true);
        try {
            await courseApi.updateLesson(courseId, chapterId, lessonId, {
                lessonName: form.lessonName,
                lessonCode: form.lessonCode,
            });

            setChapters((prev) => prev.map((chapter) => {
                if ((chapter.chapterId || chapter.id) !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: (chapter.lessons || []).map((item) => (
                        (item.lessonId || item.id) === lessonId
                            ? { ...item, lessonName: form.lessonName, lessonCode: form.lessonCode }
                            : item
                    )),
                };
            }));

            setShowEditLesson(null);
            showToast({
                title: 'Da cap nhat bai hoc',
                message: `Bai hoc "${form.lessonName}" da duoc luu thong tin moi.`,
            });
        } catch (err) {
            showToast({
                title: 'Chua the cap nhat bai hoc',
                message: err.response?.data?.message || 'Thong tin bai hoc chua duoc luu.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateLessonFlashcardSet = async (chapterId, lesson) => {
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!lessonId) return;

        try {
            await createFlashcardSetForLesson({
                lessonId,
                lessonName: lesson?.lessonName || lesson?.title || 'Bai hoc',
            });
            showToast({
                title: 'Da tao bo flashcard',
                message: 'Bai giang nay da co bo flashcard de ban tiep tuc bien soan.',
            });
            setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'flashcard' }));
            await loadLessonContent(chapterId, lessonId, {
                ...lesson,
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chua the tao bo flashcard',
                message: err.response?.data?.message || 'Bo flashcard cho bai giang nay chua duoc tao.',
            }, 'error');
        }
    };

    const handleAddVideo = async (form) => {
        const { chapterId, lessonId } = showAddVideo || {};
        if (!chapterId || !lessonId) return;

        setSaving(true);
        try {
            await courseApi.addVideo(courseId, chapterId, lessonId, {
                videoTitle: form.videoTitle,
                videoUrl: form.videoUrl,
                videoDescription: form.videoDescription || undefined,
            });
            showToast({
                title: 'Da them video',
                message: `Video "${form.videoTitle}" da duoc gan vao bai giang.`,
            });
            setShowAddVideo(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chua the them video',
                message: err.response?.data?.message || 'Video chua duoc them vao bai giang.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVideo = async (chapterId, lessonId, videoId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xoa video',
            title: 'Xoa video nay?',
            description: 'Video se bi go khoi bai giang va learner se khong con truy cap duoc.',
            confirmLabel: 'Xoa video',
            cancelLabel: 'Giu video',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteVideo(courseId, chapterId, lessonId, videoId);
            showToast({
                title: 'Da xoa video',
                message: 'Video da duoc go khoi bai giang.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chua the xoa video',
                message: err.response?.data?.message || 'Video nay chua duoc go khoi bai giang.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddDocument = async (form) => {
        const { chapterId, lessonId } = showAddDocument || {};
        if (!chapterId || !lessonId) return;

        const documentTitle = form.documentTitle?.trim();
        const fileUrl = form.fileUrl?.trim();
        const hasFile = form.file instanceof File;

        if (!documentTitle) {
            showToast({
                title: 'Thieu tieu de tai lieu',
                message: 'Can co ten tai lieu truoc khi them vao bai giang.',
            }, 'error');
            return;
        }

        if (!hasFile && !fileUrl) {
            showToast({
                title: 'Thieu nguon tai lieu',
                message: 'Hay chon file hoac dan URL tai lieu de tiep tuc.',
            }, 'error');
            return;
        }

        setSaving(true);
        try {
            if (hasFile) {
                const payload = new FormData();
                payload.append('documentTitle', documentTitle);
                payload.append('file', form.file);
                payload.append('fileName', form.fileName || form.file.name);
                payload.append('fileType', form.fileType || 'pdf');
                if (form.documentDescription?.trim()) {
                    payload.append('documentDescription', form.documentDescription.trim());
                }
                await courseApi.addDocument(courseId, chapterId, lessonId, payload);
            } else {
                await courseApi.addDocument(courseId, chapterId, lessonId, {
                    documentTitle,
                    fileUrl,
                    fileName: form.fileName || documentTitle,
                    fileType: form.fileType || 'pdf',
                    documentDescription: form.documentDescription?.trim() || undefined,
                });
            }

            showToast({
                title: 'Da them tai lieu',
                message: `Tai lieu "${documentTitle}" da duoc gan vao bai giang.`,
            });
            setShowAddDocument(null);
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chua the them tai lieu',
                message: err.response?.data?.message || 'Tai lieu chua duoc them vao bai giang.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDocument = async (chapterId, lessonId, documentId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xoa tai lieu',
            title: 'Xoa tai lieu nay?',
            description: 'Tai lieu se bi go khoi bai giang va hoc vien se khong con truy cap duoc.',
            confirmLabel: 'Xoa tai lieu',
            cancelLabel: 'Giu tai lieu',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteDocument(courseId, chapterId, lessonId, documentId);
            showToast({
                title: 'Da xoa tai lieu',
                message: 'Tai lieu da duoc go khoi bai giang.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chua the xoa tai lieu',
                message: err.response?.data?.message || 'Tai lieu nay chua duoc go khoi bai giang.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = async (form, options = {}) => {
        const { chapterId, lessonId } = showAddQuestion || {};
        const questionPayloads = Array.isArray(form) ? form.filter(Boolean) : [form].filter(Boolean);
        const totalQuestions = questionPayloads.length;
        if (!chapterId || !lessonId || totalQuestions === 0) {
            return false;
        }

        setSaving(true);
        const createdQuestions = [];
        try {
            for (const questionPayload of questionPayloads) {
                const response = await courseApi.addQuestion(courseId, chapterId, lessonId, questionPayload);
                createdQuestions.push(response?.data || response);
            }
            appendCreatedQuestionsToState(chapterId, lessonId, createdQuestions);
            showToast({
                title: 'Da them cau hoi',
                message: 'Cau hoi moi da duoc them vao bai giang.',
            });
            if (!options.keepOpen) {
                setShowAddQuestion(null);
            }
            return true;
        } catch (err) {
            if (createdQuestions.length > 0) {
                appendCreatedQuestionsToState(chapterId, lessonId, createdQuestions);
            }
            showToast({
                title: 'Chua the them cau hoi',
                message: err.response?.data?.message || 'Cau hoi chua duoc them vao bai giang.',
            }, 'error');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleEditQuestion = async (form) => {
        const chapterId = showEditQuestion?.chapterId;
        const lessonId = showEditQuestion?.lessonId;
        const questionId = showEditQuestion?.question?.questionId || null;
        if (!chapterId || !lessonId || !questionId) return;

        setSaving(true);
        try {
            await courseApi.updateQuestion(courseId, chapterId, lessonId, questionId, form);
            setShowEditQuestion(null);
            showToast({
                title: 'Owl da luu cau hoi',
                message: 'Noi dung cau hoi, dap an va giai thich da duoc cap nhat thanh cong.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            if (shouldFallbackQuestionUpdate(err)) {
                try {
                    const createdQuestion = await courseApi.addQuestion(courseId, chapterId, lessonId, form);
                    const createdQuestionId = createdQuestion?.questionId || createdQuestion?.id || null;

                    try {
                        await courseApi.deleteQuestion(courseId, chapterId, lessonId, questionId);
                    } catch (deleteErr) {
                        if (createdQuestionId) {
                            try {
                                await courseApi.deleteQuestion(courseId, chapterId, lessonId, createdQuestionId);
                            } catch (rollbackErr) {
                                console.error('Question edit rollback failed:', rollbackErr);
                            }
                        }
                        throw deleteErr;
                    }

                    setShowEditQuestion(null);
                    showToast({
                        title: 'Owl da luu cau hoi',
                        message: 'Con cu da luu cau hoi bang cach thay the ban ghi cu.',
                    });
                    await loadLessonContent(chapterId, lessonId);
                    return;
                } catch (fallbackErr) {
                    console.error('Question edit fallback failed:', fallbackErr);
                    showToast({
                        title: 'Owl chua luu duoc cau hoi',
                        message: fallbackErr.response?.data?.message || 'Con cu da thu cach thay the cau hoi nhung van chua thanh cong.',
                    }, 'error');
                    return;
                }
            }

            console.error('Question update failed:', {
                courseId,
                chapterId,
                lessonId,
                questionId,
                error: err?.response?.data || err?.message || err,
            });
            showToast({
                title: 'Owl chua luu duoc cau hoi',
                message: err.response?.data?.message || 'Con cu chua luu duoc cau hoi nay.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAssignment = async (payload) => {
        const chapterId = showAssignmentBuilder?.chapterId;
        const lessonId = showAssignmentBuilder?.lessonId;
        if (!chapterId || !lessonId) return;

        setSaving(true);
        try {
            const savedAssignment = await assignmentApi.upsertLessonAssignment(courseId, chapterId, lessonId, payload);
            setLessonTypeOverrides((prev) => ({ ...prev, [lessonId]: 'assignment' }));
            setChapters((prev) => prev.map((chapter) => {
                if ((chapter.chapterId || chapter.id) !== chapterId) {
                    return chapter;
                }

                return {
                    ...chapter,
                    lessons: (chapter.lessons || []).map((lesson) => (
                        (lesson.lessonId || lesson.id) === lessonId
                            ? {
                                ...lesson,
                                hasAssignment: true,
                                lessonType: 'assignment',
                                type: 'assignment',
                            }
                            : lesson
                    )),
                };
            }));
            setShowAssignmentBuilder(null);

            setLessonContent((prev) => (
                prev && selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lessonId
                    ? { ...prev, assignment: savedAssignment, lessonType: 'assignment' }
                    : prev
            ));

            showToast({
                title: 'Da luu assignment',
                message: 'De bai, rubric va cau hinh cham diem da duoc cap nhat.',
            });

            try {
                await loadLessonContent(chapterId, lessonId, {
                    ...getLessonById(chapterId, lessonId),
                    lessonType: 'assignment',
                    type: 'assignment',
                });
            } catch (reloadError) {
                console.warn('Assignment saved but lesson reload failed:', reloadError);
                setLessonContent((prev) => (
                    prev && selectedLesson?.chapterId === chapterId && selectedLesson?.lessonId === lessonId
                        ? { ...prev, assignment: savedAssignment, lessonType: 'assignment' }
                        : prev
                ));
            }
        } catch (err) {
            showToast({
                title: 'Chua the luu assignment',
                message: err?.response?.data?.message || err?.message || 'Co loi xay ra khi luu assignment.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveQuizTiming = async (chapterId, lesson) => {
        const lessonId = lesson?.lessonId || lesson?.id;
        if (!lessonId) return;

        const rawValue = quizTimeLimitDraft.trim();
        const parsedValue = rawValue === '' ? 0 : Number(rawValue);
        if (rawValue !== '' && (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 300)) {
            showToast({
                title: 'Chua luu duoc thoi gian lam bai',
                message: 'Thoi gian bai kiem tra nen la mot so nguyen tu 1 den 300 phut.',
            }, 'error');
            return;
        }

        const durationMinutes = rawValue === '' ? 0 : parsedValue;

        setSaving(true);
        try {
            await courseApi.updateLesson(courseId, chapterId, lessonId, { estimatedDurationMinutes: durationMinutes });

            setChapters((prev) => prev.map((chapter) => {
                if ((chapter.chapterId || chapter.id) !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: (chapter.lessons || []).map((item) => {
                        if ((item.lessonId || item.id) !== lessonId) return item;
                        return {
                            ...item,
                            estimatedDurationMinutes: durationMinutes,
                            timeLimitMinutes: durationMinutes,
                        };
                    }),
                };
            }));

            setLessonContent((prev) => (
                prev
                    ? { ...prev, estimatedDurationMinutes: durationMinutes, timeLimitMinutes: durationMinutes }
                    : prev
            ));

            showToast({
                title: durationMinutes > 0 ? 'Da luu thoi gian lam bai' : 'Da go gioi han thoi gian',
                message: durationMinutes > 0
                    ? `Bai kiem tra nay hien gioi han ${formatDurationMinutes(durationMinutes)}.`
                    : 'Bai kiem tra nay hien khong gioi han thoi gian.',
            });
        } catch (err) {
            showToast({
                title: 'Chua luu duoc thoi gian lam bai',
                message: err.response?.data?.message || 'Cai dat thoi gian chua duoc ghi lai.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (chapterId, lessonId, questionId) => {
        const confirmed = await requestConfirmation({
            badge: 'Xoa cau hoi',
            title: 'Xoa cau hoi nay?',
            description: 'Cau hoi se bi go khoi bai giang va khong con xuat hien trong phan luyen tap.',
            confirmLabel: 'Xoa cau hoi',
            cancelLabel: 'Giu cau hoi',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await courseApi.deleteQuestion(courseId, chapterId, lessonId, questionId);
            showToast({
                title: 'Da xoa cau hoi',
                message: 'Cau hoi da duoc go khoi bai giang.',
            });
            await loadLessonContent(chapterId, lessonId);
        } catch (err) {
            showToast({
                title: 'Chua the xoa cau hoi',
                message: err.response?.data?.message || 'Cau hoi nay chua duoc go khoi bai giang.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFlashcardCard = async (form, options = {}) => {
        if (!showAddFlashcardCard?.setId) return;

        const { chapterId, lessonId, setId, mode } = showAddFlashcardCard;
        const payloadItems = Array.isArray(form) ? form : [form];
        setSaving(true);
        try {
            if (mode === 'edit') {
                const [item] = payloadItems;
                if (!item?.itemId) {
                    throw new Error('Khong tim thay the flashcard can cap nhat.');
                }

                await flashcardApi.updateItem(setId, item.itemId, {
                    frontText: item.frontText,
                    backText: item.backText,
                    front: item.frontText,
                    back: item.backText,
                    frontImageUrl: item.frontImageUrl,
                    backImageUrl: item.backImageUrl,
                    cardOrder: item.cardOrder,
                });
                showToast({
                    title: 'Da cap nhat the flashcard',
                    message: 'Noi dung the da duoc luu lai trong bo flashcard.',
                });
                setShowAddFlashcardCard(null);
            } else {
                await Promise.all(payloadItems.map((item) => flashcardApi.createItem(setId, item)));
                showToast({
                    title: 'Da them the flashcard',
                    message: payloadItems.length > 1
                        ? `Vua them ${payloadItems.length} the moi vao bo flashcard.`
                        : 'Vua them 1 the moi vao bo flashcard.',
                });
                setShowAddFlashcardCard((prev) => {
                    if (!options.keepOpen || !prev) return null;
                    return { ...prev, nextOrder: (prev.nextOrder ?? 0) + payloadItems.length };
                });
            }

            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chua the them the flashcard',
                message: err.response?.data?.message || 'The flashcard chua duoc luu vao bo nay.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFlashcardItem = async ({ chapterId, lessonId, setId, itemId }) => {
        const confirmed = await requestConfirmation({
            badge: 'Xoa the',
            title: 'Xoa the flashcard nay?',
            description: 'Mat truoc, mat sau va anh cua the nay se bi go khoi bo flashcard hien tai.',
            confirmLabel: 'Xoa the',
            cancelLabel: 'Giu lai',
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            await flashcardApi.deleteItem(setId, itemId);
            showToast({
                title: 'Da xoa the flashcard',
                message: 'The da duoc go khoi bo flashcard.',
            });
            await loadLessonContent(chapterId, lessonId, {
                ...getLessonById(chapterId, lessonId),
                lessonType: 'flashcard',
                type: 'flashcard',
            });
            await fetchCourseData();
        } catch (err) {
            showToast({
                title: 'Chua the xoa the flashcard',
                message: err.response?.data?.message || 'The flashcard nay chua duoc xoa.',
            }, 'error');
        } finally {
            setSaving(false);
        }
    };

    return {
        handleAddChapter,
        handleDeleteChapter,
        handleAddLesson,
        handleDeleteLesson,
        handleEditChapter,
        handleEditLesson,
        handleCreateLessonFlashcardSet,
        loadLessonContent,
        toggleLessonContent,
        handleAddVideo,
        handleDeleteVideo,
        handleAddDocument,
        handleDeleteDocument,
        handleAddQuestion,
        handleEditQuestion,
        handleSaveAssignment,
        handleSaveQuizTiming,
        handleDeleteQuestion,
        handleSaveFlashcardCard,
        handleDeleteFlashcardItem,
    };
}
