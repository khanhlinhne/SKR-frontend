# Expert Course Analytics Backend API Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay toàn bộ dữ liệu mô phỏng trong màn `/expert/analytics` chi tiết theo khóa học bằng API backend thật để frontend chỉ cần call API và render.

**Architecture:** Giữ nguyên API `/courses` hiện tại để lấy danh sách khóa học và metadata cơ bản của course. Bổ sung 2 endpoint analytics theo từng khóa học dưới namespace `experts`, gồm một endpoint tổng quan cho charts/cards và một endpoint danh sách học viên cho tab `Học viên`; thêm 1 endpoint CSV export nếu muốn giữ nguyên nút `Xuất CSV`.

**Tech Stack:** React + Axios frontend hiện có, backend stack chưa có trong workspace, cơ sở dữ liệu quan hệ với các nguồn dữ liệu giả định gồm courses, enrollments, payments/orders, lesson progress, ratings/reviews, activity logs hoặc bảng học tập tương đương.

---

## Scope Check

Plan này chỉ bao phủ các block đang mock ở màn analytics theo từng khóa học:

- 6 metric cards
- `Số đăng ký mới`
- `Mức độ hoạt động`
- `Tiến độ theo bài giảng`
- `Phễu hoàn thành`
- `Phân bố đánh giá`
- quick stats của tab `Học viên`
- bảng danh sách học viên
- export CSV cho tab `Học viên`

Không nằm trong plan chính này:

- search box ở header layout expert
- badge notifications số `2`
- root page `/expert` vì trang đó đã dùng `expertDashboardApi.getMe()`

---

## Current Frontend File Map

**Files đang liên quan trực tiếp:**

- Modify: `src/features/expert/hooks/useExpertAnalyticsDashboard.js`
- Modify: `src/features/expert/components/analytics/AnalyticsDashboard.jsx`
- Modify: `src/features/expert/pages/ExpertAnalytics.jsx`
- Create: `src/shared/api/expertAnalyticsApi.js`
- Modify: `src/shared/api/index.js`

**Files chỉ dùng data thật, không cần đổi logic lớn:**

- Keep: `src/features/expert/components/analytics/CourseRow.jsx`
- Keep: `src/features/expert/components/layout/ExpertHeader.jsx`

**Chỗ đang mock rõ ràng trong frontend:**

- `generateMockDashboard(course)` ở `src/features/expert/hooks/useExpertAnalyticsDashboard.js`
- dòng note `dashboard mô phỏng` ở `src/features/expert/components/analytics/AnalyticsDashboard.jsx`

---

## Backend Deliverables

### 1. Overview API

`GET /experts/courses/:courseId/analytics/overview`

**Query params đề xuất:**

- `chartPeriod=week|month`
- `timezone=Asia/Bangkok`
- `from=ISO8601` optional
- `to=ISO8601` optional

**Mục đích:**

- trả về toàn bộ data cho tab `Tổng quan`
- trả về luôn metadata tính toán để frontend không phải tự suy diễn

**Response shape đề xuất:**

```json
{
  "courseId": "CRS_123",
  "generatedAt": "2026-04-18T06:30:00.000Z",
  "period": {
    "chartPeriod": "week",
    "timezone": "Asia/Bangkok",
    "from": "2026-04-14T17:00:00.000Z",
    "to": "2026-04-21T16:59:59.999Z",
    "previousFrom": "2026-04-07T17:00:00.000Z",
    "previousTo": "2026-04-14T16:59:59.999Z"
  },
  "metrics": {
    "totalRevenue": {
      "value": 381900000,
      "formattedShort": "381.9M",
      "changePct": 12.5
    },
    "newStudents": {
      "value": 47,
      "today": 9,
      "changePct": 18.0
    },
    "completionRate": {
      "value": 45,
      "changePct": 3.2
    },
    "avgStudyTimeMinutes": {
      "value": 16.8,
      "changeMinutes": 1.5
    },
    "lessonsViewed": {
      "value": 1673,
      "change": 247
    },
    "avgRating": {
      "value": 4.1,
      "change": 0.2,
      "ratingCount": 128
    }
  },
  "sparklines": {
    "revenue": [12, 16, 20, 14, 19, 23, 25, 18, 21, 27, 31, 29],
    "newStudents": [2, 4, 5, 6, 4, 5, 7, 8, 6, 7, 9, 10],
    "avgStudyTime": [12.1, 13.4, 12.8, 14.2, 13.9, 15.1, 15.8, 16.0, 15.7, 16.4, 16.2, 16.8],
    "lessonsViewed": [84, 92, 101, 105, 109, 115, 120, 135, 141, 148, 156, 167]
  },
  "newEnrollmentChart": [
    { "label": "T2", "value": 12 },
    { "label": "T3", "value": 24 },
    { "label": "T4", "value": 18 },
    { "label": "T5", "value": 27 },
    { "label": "T6", "value": 8 },
    { "label": "T7", "value": 22 },
    { "label": "CN", "value": 15 }
  ],
  "weeklyActivityChart": [
    { "label": "T2", "value": 52 },
    { "label": "T3", "value": 61 },
    { "label": "T4", "value": 28 },
    { "label": "T5", "value": 68 },
    { "label": "T6", "value": 60 },
    { "label": "T7", "value": 39 },
    { "label": "CN", "value": 35 }
  ],
  "lessonProgress": [
    {
      "lessonId": "LS_01",
      "lessonName": "Giới thiệu khóa học",
      "studentsAtLesson": 414,
      "completionRate": 96,
      "dropRate": 7
    }
  ],
  "completionFunnel": [
    { "label": "Đăng ký", "count": 478, "pct": 100, "colorToken": "violet" },
    { "label": "Bắt đầu học", "count": 406, "pct": 85, "colorToken": "blue" },
    { "label": "Hoàn thành 50%", "count": 277, "pct": 58, "colorToken": "cyan" },
    { "label": "Hoàn thành 75%", "count": 167, "pct": 35, "colorToken": "amber" },
    { "label": "Hoàn thành 100%", "count": 215, "pct": 45, "colorToken": "emerald" }
  ],
  "ratingBreakdown": [
    { "stars": 5, "pct": 45, "count": 58 },
    { "stars": 4, "pct": 28, "count": 36 },
    { "stars": 3, "pct": 15, "count": 19 },
    { "stars": 2, "pct": 8, "count": 10 },
    { "stars": 1, "pct": 4, "count": 5 }
  ]
}
```

### 2. Enrollments API

`GET /experts/courses/:courseId/enrollments`

**Query params đề xuất:**

- `page=1`
- `limit=20`
- `search=`
- `status=all|active|completed|expired|pending`
- `sortField=date|cost|name|id`
- `sortDirection=asc|desc`

**Mục đích:**

- data cho tab `Học viên`
- backend xử lý search, filter, sort, pagination
- frontend không phải filter dữ liệu giả ở local nữa

**Response shape đề xuất:**

```json
{
  "courseId": "CRS_123",
  "summary": {
    "totalEnrollments": 478,
    "activeCount": 312,
    "completedCount": 96,
    "grossRevenue": 381900000
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 478,
    "totalPages": 24
  },
  "items": [
    {
      "id": "ENR-1001",
      "learnerId": "USR_9001",
      "fullName": "Nguyễn Văn A",
      "email": "vana@example.com",
      "mobile": "0901234567",
      "avatarUrl": "",
      "date": "2026-04-12T02:30:00.000Z",
      "cost": 799000,
      "status": "active",
      "progress": 78
    }
  ]
}
```

### 3. Export API

`GET /experts/courses/:courseId/enrollments/export`

**Query params giống Enrollments API:**

- `search`
- `status`
- `sortField`
- `sortDirection`
- `format=csv`

**Mục đích:**

- làm cho nút `Xuất CSV` dùng được ngay

---

## Data Definition Contract

Backend cần chốt công thức để frontend khỏi phải đoán:

- `totalRevenue`: tổng doanh thu thành công của course từ enrollments/orders đã thanh toán thành công, không tính đơn failed/cancelled/refunded.
- `newStudents.value`: số enrollments mới trong kỳ hiện tại.
- `newStudents.today`: số enrollments mới từ `00:00` đến hiện tại theo `timezone`.
- `completionRate.value`: `số học viên đạt progress = 100 / số học viên đã bắt đầu học` nhân `100`, làm tròn xuống hoặc 1 chữ số thập phân tùy chuẩn chung.
- `avgStudyTimeMinutes.value`: trung bình số phút học trên mỗi learner active trong kỳ hiện tại.
- `lessonsViewed.value`: tổng số lượt xem bài học trong kỳ hiện tại; nếu chưa có event view thì dùng số lần lesson progress cập nhật làm fallback và phải ghi rõ trong docs backend.
- `avgRating.value`: trung bình rating published của course.
- `lessonProgress.studentsAtLesson`: số học viên có bước hiện tại đang ở lesson đó hoặc đã chạm lesson đó, backend chọn 1 định nghĩa và dùng nhất quán.
- `lessonProgress.dropRate`: tỷ lệ rơi rụng tại lesson đó; nên tính `1 - next_step_users/current_step_users`.
- `completionFunnel`: luôn cùng tập nhãn để frontend render ổn định.

---

## Recommended Backend Query Strategy

### Source mapping tối thiểu

- courses: lấy metadata course hiện đã có từ `/courses`
- enrollments: nguồn chính cho số học viên, ngày đăng ký, trạng thái
- orders/payments: nguồn doanh thu
- lesson progress hoặc lesson completion: nguồn tiến độ theo bài, funnel, progress của bảng học viên
- ratings/reviews: nguồn rating trung bình và breakdown
- study/activity events: nguồn `Mức độ hoạt động` và `Thời gian học TB`

### Fallback strategy nếu backend chưa có event log đầy đủ

- `Mức độ hoạt động`: dùng `daily active learners` thay cho `số lượt thao tác`
- `Thời gian học TB`: nếu không đo được minutes thì tạm trả `null`, frontend hiển thị `--`
- `Bài học đã xem`: dùng tổng lesson completion events hoặc progress updates

Khuyến nghị của plan này là backend nên trả field thật hoặc `null`, không fabricate số liệu.

---

## Frontend Integration Strategy

### API client mới

Tạo `src/shared/api/expertAnalyticsApi.js`:

```js
import axiosClient from "./axiosClient";

const expertAnalyticsApi = {
    getOverview(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/analytics/overview`, { params });
    },
    getEnrollments(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments`, { params });
    },
    exportEnrollments(courseId, params) {
        return axiosClient.get(`/experts/courses/${courseId}/enrollments/export`, {
            params,
            responseType: "blob",
        });
    },
};

export default expertAnalyticsApi;
```

### Hook cần đổi

`src/features/expert/hooks/useExpertAnalyticsDashboard.js`

- bỏ hẳn `generateMockDashboard`
- gọi `expertAnalyticsApi.getOverview(courseId, { chartPeriod, timezone })`
- gọi `expertAnalyticsApi.getEnrollments(courseId, { search, status, sortField, sortDirection, page, limit })`
- chỉ map response sang UI shape hiện tại nếu cần
- không còn `Math.random()`

### UI cần đổi

`src/features/expert/components/analytics/AnalyticsDashboard.jsx`

- xóa note `dashboard mô phỏng này`
- dùng data `overview.metrics`, `overview.newEnrollmentChart`, `overview.weeklyActivityChart`, `overview.lessonProgress`, `overview.completionFunnel`, `overview.ratingBreakdown`
- nối nút `Xuất CSV` vào `exportEnrollments`

### Page container

`src/features/expert/pages/ExpertAnalytics.jsx`

- giữ nguyên `courseApi.getAll()` để lấy list course
- không cần tự tính `overallStats` bằng API mới nếu business chưa yêu cầu

---

## Chunk 1: Freeze API Contract

### Task 1: Chốt definition cho từng block

**Files:**

- Modify: `docs/superpowers/plans/2026-04-18-expert-analytics-backend-api.md`

- [ ] Liệt kê 1:1 mỗi block UI với field backend trả về.
- [ ] Chốt định nghĩa cho `completionRate`, `lessonsViewed`, `avgStudyTimeMinutes`, `activity`.
- [ ] Chốt timezone mặc định là `Asia/Bangkok` nếu request không truyền.
- [ ] Chốt enum `status` để khớp đúng UI hiện tại: `active`, `completed`, `expired`, `pending`.

### Task 2: Chốt lỗi và empty states

**Files:**

- Modify: `docs/superpowers/plans/2026-04-18-expert-analytics-backend-api.md`

- [ ] Quy định response `404` nếu `courseId` không thuộc expert hiện tại.
- [ ] Quy định response thành công với mảng rỗng và metric `0` nếu course chưa có learner.
- [ ] Quy định field nào được phép `null` thay vì backend bịa số liệu.

---

## Chunk 2: Backend Overview Endpoint

### Task 3: Implement aggregate query cho metrics overview

**Backend logical modules:**

- Create: `backend/modules/expert-analytics/overview.controller` equivalent
- Create: `backend/modules/expert-analytics/overview.service` equivalent
- Create: `backend/modules/expert-analytics/overview.repository` equivalent
- Create: `backend/modules/expert-analytics/overview.dto` equivalent

- [ ] Validate quyền expert sở hữu course.
- [ ] Aggregate `totalRevenue`, `newStudents`, `completionRate`, `avgStudyTimeMinutes`, `lessonsViewed`, `avgRating`.
- [ ] Tính `changePct` hoặc `change` bằng cách so với kỳ trước có cùng độ dài.
- [ ] Trả về `0` hoặc `null` nhất quán theo contract.
- [ ] Thêm test backend cho course có data và course rỗng.

### Task 4: Implement chart payload cho overview

**Backend logical modules:**

- Modify: `backend/modules/expert-analytics/overview.service` equivalent
- Modify: `backend/modules/expert-analytics/overview.repository` equivalent

- [ ] Trả `newEnrollmentChart` theo `chartPeriod`.
- [ ] Trả `weeklyActivityChart` theo 7 ngày trong tuần.
- [ ] Trả `lessonProgress` theo lesson order thật từ curriculum.
- [ ] Trả `completionFunnel` với đúng 5 mốc.
- [ ] Trả `ratingBreakdown` theo star 1-5.

---

## Chunk 3: Backend Enrollments Endpoint

### Task 5: Implement danh sách học viên

**Backend logical modules:**

- Create: `backend/modules/expert-analytics/enrollments.controller` equivalent
- Create: `backend/modules/expert-analytics/enrollments.service` equivalent
- Create: `backend/modules/expert-analytics/enrollments.repository` equivalent
- Create: `backend/modules/expert-analytics/enrollments.dto` equivalent

- [ ] Join learner profile, enrollment, progress, payment amount.
- [ ] Hỗ trợ `search`, `status`, `sortField`, `sortDirection`, `page`, `limit`.
- [ ] Trả `summary` để frontend render quick stats không phải tự đếm.
- [ ] Bảo đảm `progress` nằm trong `[0,100]`.
- [ ] Bảo đảm status mapping khớp UI.

### Task 6: Implement CSV export

**Backend logical modules:**

- Create: `backend/modules/expert-analytics/enrollments-export.controller` equivalent
- Modify: `backend/modules/expert-analytics/enrollments.service` equivalent

- [ ] Dùng cùng filter/sort logic như endpoint danh sách.
- [ ] Trả file CSV với header ổn định: `Enrollment ID`, `Learner Name`, `Email`, `Phone`, `Enrolled Date`, `Paid Amount`, `Progress`, `Status`.
- [ ] Test export với dataset có dấu tiếng Việt.

---

## Chunk 4: Frontend Integration

### Task 7: Add API client

**Files:**

- Create: `src/shared/api/expertAnalyticsApi.js`
- Modify: `src/shared/api/index.js`

- [ ] Thêm `getOverview`.
- [ ] Thêm `getEnrollments`.
- [ ] Thêm `exportEnrollments`.

### Task 8: Replace mock hook bằng API thật

**Files:**

- Modify: `src/features/expert/hooks/useExpertAnalyticsDashboard.js`

- [ ] Xóa `generateMockDashboard`.
- [ ] Tách state `overview`, `enrollments`, `pagination`, `loading`, `error`.
- [ ] Refetch `overview` khi đổi `chartPeriod`.
- [ ] Refetch `enrollments` khi đổi search/filter/sort/page.
- [ ] Debounce `searchTerm` ở frontend nếu cần để tránh spam API.

### Task 9: Wire UI vào response backend

**Files:**

- Modify: `src/features/expert/components/analytics/AnalyticsDashboard.jsx`

- [ ] Map metric cards sang `overview.metrics`.
- [ ] Map charts sang `newEnrollmentChart` và `weeklyActivityChart`.
- [ ] Map `lessonProgress`, `completionFunnel`, `ratingBreakdown`.
- [ ] Map tab `Học viên` sang `summary` và `items`.
- [ ] Nối nút `Xuất CSV`.
- [ ] Xóa text `dashboard mô phỏng`.

---

## Acceptance Criteria

- Không còn bất kỳ `Math.random()` hoặc mock learner names/email/phone trong luồng `/expert/analytics`.
- Chuyển giữa `Tuần` và `Tháng` chỉ refetch overview API, không tạo số liệu local.
- Search, filter, sort ở tab `Học viên` phản ánh đúng dữ liệu backend.
- Nếu course không có learner, UI vẫn render bình thường với `0` hoặc `--`.
- Nút `Xuất CSV` tải được file thật từ backend.
- Frontend chỉ còn responsibility là `call API -> map response -> render`.

---

## API Questions Already Answered By This Plan

Để tránh frontend phải hỏi lại backend trong lúc call API, plan này đã chốt sẵn:

- namespace endpoint nên là `experts/courses/:courseId/...`
- `status` dùng đúng 4 giá trị hiện có trong UI
- response overview gộp toàn bộ block `Tổng quan`
- response enrollments gộp luôn `summary` + `pagination` + `items`
- timezone mặc định là `Asia/Bangkok`
- field không tính được phải trả `null`, không mock

---

## Minimal Rollout Order

1. Backend làm `GET /experts/courses/:courseId/analytics/overview`
2. Backend làm `GET /experts/courses/:courseId/enrollments`
3. Frontend bỏ `generateMockDashboard` và nối 2 endpoint trên
4. Backend làm thêm `export` nếu muốn hoàn thiện nút CSV

---

## Handoff Note For Backend Team

Đây là màn analytics theo từng khóa học trong creator/expert portal, không phải dashboard tổng quan toàn expert. Frontend hiện đã có list course thật từ `/courses`; phần còn thiếu chỉ là analytics payload theo từng course. Nếu backend giữ đúng response contract ở plan này, frontend chỉ cần tạo `expertAnalyticsApi`, map response vào hook hiện tại, và bỏ phần mock là xong.

