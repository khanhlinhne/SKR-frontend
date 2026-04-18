import test from 'node:test';
import assert from 'node:assert/strict';
import { isSupportedLessonType, normalizeLessonType } from './lessonType.js';

test('normalizeLessonType maps backend test aliases to quiz', () => {
    assert.equal(normalizeLessonType('test'), 'quiz');
    assert.equal(normalizeLessonType('tests'), 'quiz');
    assert.equal(normalizeLessonType('practice_test'), 'quiz');
    assert.equal(normalizeLessonType('practice-test'), 'quiz');
});

test('isSupportedLessonType accepts normalized quiz aliases', () => {
    assert.equal(isSupportedLessonType('test'), true);
    assert.equal(isSupportedLessonType('practice_test'), true);
});
