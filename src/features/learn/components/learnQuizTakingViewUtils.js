import { QUIZ_DIFFICULTY_STYLES } from './learnQuizUtils';

export function getDifficultyClass(level) {
    return QUIZ_DIFFICULTY_STYLES[level] || 'bg-base-200 text-base-content/60';
}

export function getScoreTone(percentage) {
    if (percentage >= 80) {
        return {
            chip: 'bg-emerald-500/10 text-emerald-700',
            text: 'text-emerald-600',
            stroke: 'stroke-emerald-500',
            label: 'Nắm bài rất tốt',
        };
    }

    if (percentage >= 50) {
        return {
            chip: 'bg-blue-500/10 text-blue-700',
            text: 'text-blue-600',
            stroke: 'stroke-blue-500',
            label: 'Đạt yêu cầu',
        };
    }

    return {
        chip: 'bg-rose-500/10 text-rose-700',
        text: 'text-rose-600',
        stroke: 'stroke-rose-500',
        label: 'Cần ôn lại',
    };
}
