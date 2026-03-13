# Public Courses Home And Detail Design

**Date:** 2026-03-13

**Goal:** Biến homepage thành điểm vào public catalog có chọn lọc, đưa người dùng vào `Public Course Detail` để ra quyết định, và cho phép đi thẳng tới checkout khi bấm `Mua ngay`.

## 1. Product Decision

### 1.1 Page roles

- `/` vẫn là homepage marketing.
- `homepage -> Public Courses section` chỉ hiển thị một số khóa học public nổi bật lấy từ backend thật.
- `/courses/:id` trở thành `Public Course Detail` theo kiểu landing page bán khóa học.
- `/courses/:id/learn` giữ vai trò màn học sau khi đã sở hữu khóa học.
- `/checkout?type=course&id=<courseId>` là checkout dành cho course purchase.

### 1.2 CTA strategy

Trên homepage card:

- CTA chính: `Xem khóa học`
- CTA phụ: `Mua ngay`

Luồng:

- `Home -> Xem khóa học -> /courses/:id`
- `Home -> Mua ngay -> login nếu chưa đăng nhập -> checkout`
- `Course Detail -> Mua ngay -> login nếu chưa đăng nhập -> checkout`

### 1.3 Authentication gate

Khi người dùng chưa đăng nhập mà bấm `Mua ngay`:

- redirect tới `/login`
- giữ lại `redirect=/checkout?type=course&id=<courseId>`
- sau khi login xong quay lại checkout đúng course

Lý do:

- rõ ràng về purchase ownership
- giảm rớt bước cuối
- đơn giản hơn với cấu trúc repo hiện tại

## 2. UX Pattern Reference

Thiết kế này bám theo mô hình e-learning phổ biến:

- Coursera: public browse page -> public course page với `What you'll learn`, `modules`, `instructor`, `reviews` -> enroll
- edX: public catalog -> enrollment/about page -> learner dashboard
- Udemy: public course landing page để bán khóa học, nhấn mạnh outcomes, curriculum preview, instructor, pricing

Áp dụng cho SKR:

- homepage không làm catalog đầy đủ
- course detail là trang “decision page”
- learn page là trải nghiệm sau khi đã sở hữu

## 3. Homepage Public Courses Section

### 3.1 Data source

Frontend gọi:

- `GET /api/courses?status=published&isFeatured=true&limit=3&sortBy=displayOrder&sortOrder=asc`

Fallback khi số lượng featured ít:

- gọi thêm `GET /api/courses?status=published&limit=6&sortBy=purchaseCount&sortOrder=desc`
- merge vào danh sách cho đủ 3 card

### 3.2 What to show on each card

Mỗi card chỉ hiển thị:

- course banner
- course name
- instructor name
- short subtitle / description ngắn
- price
- 3 stats ngắn, ví dụ:
  - số bài học
  - số câu hỏi hoặc số chương
  - thời lượng
- CTA `Xem khóa học`
- CTA `Mua ngay`

Không hiển thị quá nhiều metadata để tránh biến homepage thành trang catalog dày đặc.

### 3.3 Visual tone

Section này nên giữ phong cách hiện tại của homepage:

- premium, sạch, editorial
- 3 card lớn, không quá chật
- mỗi card có giá và preview cấu trúc khóa học
- CTA phụ `Mua ngay` nhỏ hơn CTA chính nhưng vẫn đủ rõ

### 3.4 Empty/error handling

- nếu API lỗi: section vẫn render layout, hiển thị state nhẹ kiểu “Đang cập nhật khóa học nổi bật”
- nếu không có khóa public: ẩn CTA mua và chuyển section thành trust/coming soon

## 4. Public Course Detail

### 4.1 Route decision

Không tạo route public mới.

Sử dụng:

- `/courses/:id` cho public detail
- `/courses/:id/learn` cho learning experience

Điều này giữ URL tự nhiên, tốt cho share/SEO/campaign, và tránh trùng vai trò route.

### 4.2 Page structure

`/courses/:id` nên có layout public-first, không dùng `DashboardSidebar`.

Suggested sections:

1. Hero
- title
- subtitle
- instructor
- rating + số học viên
- level + thời lượng + số bài học
- banner hoặc preview video
- giá + CTA sticky

2. What you'll learn
- 4-6 learning outcomes ngắn

3. Curriculum preview
- danh sách chương
- mở xem trước một số bài miễn phí
- bài còn lại hiện tên nhưng bị khóa nhẹ

4. Instructor
- avatar
- tên
- uy tín ngắn
- số lượng khóa học / người học nếu có

5. Reviews / social proof
- rating summary
- 2-3 review mẫu

6. FAQ / purchase reassurance
- truy cập bao lâu
- có hoàn tiền hay không
- có tài liệu / flashcards / quiz gì đi kèm

### 4.3 Sticky purchase box

Sidebar sticky hoặc floating panel gồm:

- giá hiện tại
- original price nếu có discount
- badge giảm giá
- những gì sẽ nhận được
- CTA `Mua ngay`
- CTA phụ `Xem bài học thử` nếu có preview

Nếu course free:

- CTA chính đổi thành `Học miễn phí`

Nếu user đã sở hữu:

- CTA đổi thành `Vào học ngay`

## 5. Curriculum Preview With Free Lessons

### 5.1 Product behavior

Public detail cho phép xem trước một vài bài miễn phí.

Quy tắc đề xuất:

- mỗi chương mở preview 1 bài đầu
- hoặc backend/front-end xác định `isPreview` cho bài đầu mỗi chương
- các bài còn lại vẫn hiển thị tên để user thấy cấu trúc thật, nhưng có lock icon

### 5.2 Preview scope

Preview cho phép:

- nhìn thấy tiêu đề bài
- thời lượng
- loại nội dung
- mở một số bài mẫu

Preview không cho:

- toàn bộ chương trình
- truy cập toàn bộ lessons
- vào learning dashboard đầy đủ

### 5.3 Current data limitation

Backend `course detail` hiện trả chapter + lesson, nhưng chưa có cờ `isPreview`.

Giải pháp giai đoạn 1:

- frontend tự gắn `isPreview = lesson đầu tiên của mỗi chapter`

Giải pháp giai đoạn 2:

- backend bổ sung trường `isPreview` hoặc `previewType`

Khuyến nghị:

- triển khai giai đoạn 1 trước vì phù hợp scope hiện tại

## 6. Data And API Design

### 6.1 Existing backend capabilities already usable

Backend hiện hỗ trợ:

- `GET /api/courses`
- `GET /api/courses/:id`
- filter `status=published`
- filter `isFeatured=true`
- sort theo `displayOrder`, `purchaseCount`, `ratingAverage`, `publishedAt`

Điều này đủ cho phiên bản đầu của public catalog.

### 6.2 Frontend data contract

Homepage featured section cần:

- `courseId`
- `courseName`
- `courseDescription`
- `courseBannerUrl`
- `priceAmount`
- `originalPrice`
- `discountPercent`
- `estimatedDurationHours`
- `totalLessons`
- `totalQuestions`
- `creator`
- `isFeatured`

Public detail cần thêm:

- `coursePreviewVideoUrl`
- `totalChapters`
- `totalVideos`
- `totalDocuments`
- `chapters`

### 6.3 Mapping note

Hiện frontend đang dùng `subjectApi` để normalize `course -> subject`.

Thiết kế khuyến nghị:

- giữ compatibility ngắn hạn để tránh vỡ nhiều nơi
- nhưng public course section/detail nên dần chuyển sang naming `course`
- tránh dùng mock `subject` semantics ở homepage public

## 7. Checkout Design

### 7.1 Desired behavior

`Checkout` phải hỗ trợ mode mua course thật, không chỉ plan subscription.

Input URL:

- `/checkout?type=course&id=<courseId>`

Checkout cần:

- fetch course detail ngắn
- hiển thị tên course, giá, giảm giá
- chọn payment method
- tạo order cho course đó

### 7.2 Login guard

Nếu chưa login:

- redirect sang login trước

Nếu đã login:

- vào checkout luôn

### 7.3 Success flow

Sau thanh toán thành công:

- route về `/courses/:id`
- UI course detail đổi thành `Đã sở hữu` hoặc `Vào học ngay`
- CTA trên card/home/detail phản ánh trạng thái sở hữu nếu dữ liệu purchase đã có

## 8. Component And File Strategy

### 8.1 Homepage

Modify:

- `src/features/home/pages/Homepage.jsx`
- `src/features/home/components/ExpertCoursesSection.jsx`
- `src/features/home/constants.js`

Create:

- `src/features/home/components/PublicCourseFeatureCard.jsx`
- `src/features/home/utils/mapPublicCourse.js`

### 8.2 Public course detail

Modify or split from:

- `src/features/courses/pages/CourseDetail.jsx`

Create recommended:

- `src/features/courses/pages/PublicCourseDetail.jsx`
- `src/features/courses/components/PublicCourseHero.jsx`
- `src/features/courses/components/PublicCourseOutcomes.jsx`
- `src/features/courses/components/PublicCourseCurriculumPreview.jsx`
- `src/features/courses/components/PublicCourseInstructor.jsx`
- `src/features/courses/components/PublicCourseReviews.jsx`
- `src/features/courses/components/PublicCoursePurchaseBox.jsx`

Route:

- keep `/courses/:id`, but point it to the public-first page

### 8.3 Learn page

Keep:

- `/courses/:id/learn`

No major UX rewrite needed for this scope.

### 8.4 Checkout

Modify:

- `src/features/checkout/pages/Checkout.jsx`
- `src/shared/api/orderApi.js`

Optional create:

- `src/shared/api/courseApi.js` or continue through `subjectApi`
- `src/features/checkout/utils/checkoutCourseMapper.js`

## 9. Non-goals For This Iteration

Không làm ở vòng đầu:

- public catalog full page riêng kiểu marketplace
- search/filter public nâng cao
- multiple preview policies do admin cấu hình
- review system thật từ backend
- order history hoàn chỉnh cho course purchase nếu backend chưa support
- ownership sync phức tạp nhiều loại package/course/subscription cùng lúc

## 10. Recommended Rollout

### Phase 1

- homepage public courses lấy backend thật
- `/courses/:id` thành public-first
- preview bài đầu mỗi chương
- `Mua ngay` trên homepage và detail
- login redirect trước checkout

### Phase 2

- checkout course-aware thật
- purchase state thật
- CTA `Đã sở hữu / Vào học ngay`

### Phase 3

- public catalog đầy đủ
- review thật
- preview policy từ backend

## 11. Success Criteria

- homepage hiển thị đúng 3 khóa học public nổi bật từ backend thật
- card homepage có đủ `Xem khóa học` và `Mua ngay`
- `/courses/:id` có cảm giác landing page bán khóa học, không phải learner dashboard
- curriculum cho mở preview một vài bài miễn phí
- bấm `Mua ngay` khi chưa login sẽ login rồi quay lại checkout đúng course
- bấm `Mua ngay` khi đã login sẽ vào checkout course flow ngay
