# Learner Course Progress API Contract

## Mục tiêu

Frontend phần `Learn` hiện đã sẵn sàng để:

- đọc tiến độ học thật của learner khi mở khóa học,
- cho learner bấm `Hoàn thành` ở từng lesson,
- lưu tiến độ thật xuống backend,
- cập nhật ngay sidebar, progress bar, số bài hoàn thành và phần trăm tiến độ.

Để tính năng này hoạt động ổn định, backend cần triển khai đầy đủ 2 API:

- `GET /courses/:courseId/progress`
- `PUT /courses/:courseId/progress`

Frontend hiện đang gọi các API này tại:

- [courseApi.js](</e:/DoAN/Code/SKR-frontend/src/shared/api/courseApi.js:42>)
- [useLearnPageState.js](</e:/DoAN/Code/SKR-frontend/src/features/learn/hooks/useLearnPageState.js:249>)
- [useLearnPageState.js](</e:/DoAN/Code/SKR-frontend/src/features/learn/hooks/useLearnPageState.js:512>)

## Nghiệp vụ cần hỗ trợ

Một learner đã enroll vào khóa học có thể đánh dấu từng lesson là hoàn thành.

Tiến độ khóa học được tính theo số lesson hoàn thành trên tổng số lesson của khóa học:

- `progressPercent = round(completedLessons / totalLessons * 100)`
- `completedLessons` là số lesson learner đã hoàn thành thực tế
- `totalLessons` lấy theo chương trình học hiện tại của khóa

Tiến độ này cần dùng lại được ở các màn:

- trang học `Learn`
- trang `My Courses`
- các màn dashboard learner sau này

## 1. GET /courses/:courseId/progress

### Mục đích

Trả về tiến độ hiện tại của learner cho một khóa học cụ thể.

### Auth

- Bắt buộc đăng nhập
- Chỉ learner đã enroll khóa học đó mới được xem

### Path params

- `courseId`: id khóa học

### Response khuyến nghị

Frontend hiện parse khá linh hoạt, nhưng backend nên trả đúng format dưới đây để dễ bảo trì:

```json
{
  "courseId": 12,
  "learnerId": 34,
  "totalLessons": 11,
  "completedLessons": 3,
  "progressPercent": 27,
  "completedLessonIds": [101, 102, 108],
  "updatedAt": "2026-04-18T10:20:30.000Z"
}
```

### Trường bắt buộc để frontend chạy tốt

- `completedLessonIds`
  - Mảng lesson id learner đã hoàn thành
  - Đây là field frontend ưu tiên đọc

### Trường nên có thêm

- `totalLessons`
- `completedLessons`
- `progressPercent`
- `updatedAt`

### Ghi chú tương thích

Frontend hiện vẫn đọc được các shape sau, nếu backend muốn giữ format cũ:

```json
{
  "lessonIds": [101, 102, 108]
}
```

hoặc:

```json
{
  "completedLessons": [101, 102, 108]
}
```

hoặc:

```json
{
  "progress": [
    { "lessonId": 101, "completed": true },
    { "lessonId": 102, "completed": true },
    { "lessonId": 108, "completed": true }
  ]
}
```

Nhưng backend nên chuẩn hóa về `completedLessonIds` để tránh mơ hồ.

### Status code

- `200 OK`: trả tiến độ thành công
- `401 Unauthorized`: chưa đăng nhập
- `403 Forbidden`: không có quyền hoặc chưa enroll khóa học
- `404 Not Found`: course không tồn tại

## 2. PUT /courses/:courseId/progress

### Mục đích

Cập nhật trạng thái hoàn thành cho một lesson trong khóa học.

### Auth

- Bắt buộc đăng nhập
- Chỉ learner đã enroll khóa học đó mới được cập nhật

### Path params

- `courseId`: id khóa học

### Request body

Frontend hiện đang gửi:

```json
{
  "lessonId": 108,
  "chapterId": 21,
  "completed": true
}
```

### Ý nghĩa field

- `lessonId`: bắt buộc
- `chapterId`: nên hỗ trợ
  - frontend có gửi nếu đang có
  - backend có thể dùng để validate lesson thuộc đúng chapter/course
- `completed`: boolean
  - `true`: đánh dấu hoàn thành
  - `false`: bỏ đánh dấu hoàn thành nếu sau này cần hỗ trợ

### Response khuyến nghị

Backend nên trả lại snapshot tiến độ mới nhất ngay sau khi update:

```json
{
  "courseId": 12,
  "learnerId": 34,
  "lessonId": 108,
  "chapterId": 21,
  "completed": true,
  "totalLessons": 11,
  "completedLessons": 4,
  "progressPercent": 36,
  "completedLessonIds": [101, 102, 108, 109],
  "updatedAt": "2026-04-18T10:25:00.000Z"
}
```

Frontend hiện chưa bắt buộc dùng response này để render, nhưng backend nên trả để:

- dễ debug
- các client khác dùng lại
- sau này frontend có thể bỏ optimistic state nếu cần

### Status code

- `200 OK`: cập nhật thành công
- `400 Bad Request`: thiếu `lessonId`, `completed` không hợp lệ, lesson không thuộc course
- `401 Unauthorized`: chưa đăng nhập
- `403 Forbidden`: learner chưa enroll hoặc không có quyền
- `404 Not Found`: course/lesson không tồn tại

## Validation backend bắt buộc

Khi nhận request update progress, backend cần kiểm tra:

1. `courseId` tồn tại
2. `lessonId` tồn tại
3. `lessonId` thực sự thuộc `courseId`
4. Nếu có `chapterId`, lesson phải thuộc đúng `chapterId`
5. User hiện tại đã enroll khóa học
6. Không cho user khác sửa progress của người khác

## Quy tắc lưu dữ liệu

Khuyến nghị backend lưu theo mô hình `1 learner + 1 course + 1 lesson = 1 progress record`.

Ví dụ bảng:

- `enrollment_lesson_progress`
  - `id`
  - `enrollmentId`
  - `courseId`
  - `chapterId`
  - `lessonId`
  - `completed`
  - `completedAt`
  - `updatedAt`

### Rule update

- Nếu chưa có record, tạo mới
- Nếu đã có record, update lại
- Với `completed = true`
  - set `completed = true`
  - set `completedAt = now` nếu trước đó chưa có
- Với `completed = false`
  - set `completed = false`
  - có thể giữ hoặc clear `completedAt`, nhưng cần thống nhất

## Quy tắc tính tiến độ khóa học

Backend nên tính:

- `totalLessons`: tổng lesson hiện tại của khóa
- `completedLessons`: số lesson có `completed = true`
- `progressPercent`:

```text
round(completedLessons / totalLessons * 100)
```

### Ghi chú

- Nếu khóa học thêm lesson mới, `totalLessons` phải cập nhật theo dữ liệu thật
- Nếu lesson bị xóa, tiến độ cần được tính lại theo lesson còn tồn tại
- Không nên chỉ lưu phần trăm tĩnh mà không có dữ liệu lesson-level

## Yêu cầu hiệu năng

GET progress cần đủ nhẹ để mỗi lần learner mở khóa học có thể gọi ngay.

Khuyến nghị:

- query theo `courseId + learnerId`
- index theo `enrollmentId` hoặc `courseId + learnerId`
- chỉ trả dữ liệu cần thiết

## Yêu cầu idempotent

API `PUT /courses/:courseId/progress` cần idempotent:

- gọi nhiều lần cùng payload `completed: true` không được tạo record trùng
- gọi lại cùng payload vẫn phải trả thành công

## Tác động tới frontend hiện tại

Nếu backend làm đúng spec trên thì frontend hiện tại sẽ dùng được ngay cho:

- nút `Hoàn thành` ở lesson video/document
- nút hoàn thành trong flashcard lesson
- auto-complete sau khi nộp quiz
- auto-complete sau khi nộp assignment
- sidebar hiển thị số bài hoàn thành thật
- thanh progress % hiển thị đúng theo dữ liệu thật

## Acceptance checklist cho backend

- Có `GET /courses/:courseId/progress`
- Có `PUT /courses/:courseId/progress`
- `GET` trả `completedLessonIds`
- `PUT` nhận được body `{ lessonId, chapterId, completed }`
- `PUT completed=true` lưu được tiến độ lesson
- `GET` sau đó trả đúng lesson vừa hoàn thành
- `progressPercent` tăng đúng
- Learner reload trang học vẫn thấy lesson đã hoàn thành
- Màn `My Courses` có thể dùng lại cùng dữ liệu để hiện progress thật

## Ví dụ test tay nhanh

### Bước 1: mở khóa học

```http
GET /api/courses/12/progress
Authorization: Bearer <token>
```

Kỳ vọng:

```json
{
  "courseId": 12,
  "completedLessonIds": [101, 102],
  "completedLessons": 2,
  "totalLessons": 11,
  "progressPercent": 18
}
```

### Bước 2: learner bấm hoàn thành lesson 108

```http
PUT /api/courses/12/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": 108,
  "chapterId": 21,
  "completed": true
}
```

Kỳ vọng:

```json
{
  "courseId": 12,
  "lessonId": 108,
  "completed": true,
  "completedLessonIds": [101, 102, 108],
  "completedLessons": 3,
  "totalLessons": 11,
  "progressPercent": 27
}
```

### Bước 3: learner reload lại trang

```http
GET /api/courses/12/progress
```

Kỳ vọng lesson `108` vẫn nằm trong `completedLessonIds`.
