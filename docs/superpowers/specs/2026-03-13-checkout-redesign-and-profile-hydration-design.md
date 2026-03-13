# Checkout Redesign And Profile Hydration Design

## Goal

Làm lại trải nghiệm checkout để đồng bộ với visual language của homepage/public course detail, đồng thời hiển thị đúng tài khoản đang mua ngay sau khi người dùng đăng nhập.

## Context

- Checkout hiện dùng `NavBar` cũ và các card mang phong cách khác với phần `apple-*` đang dùng ở homepage/course detail.
- Với luồng mua course, người dùng được redirect qua login rồi quay lại checkout, nhưng profile cache chưa được hydrate ngay nên giao diện vẫn có thể hiện placeholder kiểu `System User`.
- Người dùng muốn checkout giống pattern của các hệ e-learning lớn: account identity rõ ràng, course summary rõ ràng, payment gọn.

## UX Direction

Chọn hướng `2-step checkout shell`:

- Giữ stepper 2 bước hiện có vì flow codebase đã có sẵn và không tạo thêm rủi ro.
- Đổi toàn bộ shell sang style `apple-panel / apple-card-shadow / rounded-[32px]` để đồng bộ với public surfaces mới.
- Dùng header checkout tối giản thay cho `NavBar` cũ.
- Thêm card `Tài khoản đang mua` với:
  - avatar
  - tên
  - email
  - dòng mô tả `Khóa học sẽ được gắn vào tài khoản này sau khi thanh toán`

## Layout

### Step 1: Xác nhận khóa học

Trái:
- `Tài khoản đang mua`
- `Khóa học sắp sở hữu`

Phải:
- sticky `Tổng thanh toán`
- coupon
- CTA `Tiếp tục`

### Step 2: Thanh toán

Trái:
- `Tài khoản đang mua` ở dạng compact
- `Phương thức thanh toán`

Phải:
- sticky `Tổng thanh toán`
- trust notes ngắn
- CTA `Thanh toán an toàn`

## Data Flow

### Checkout profile

- Checkout dùng `useCurrentUserProfile()` để đọc cache và tự refresh nếu cần.
- Nếu đang có token nhưng profile cache chưa đủ, checkout sẽ hiện skeleton/account loading ngắn thay vì placeholder sai.

### Login profile hydration

- Sau `authApi.login()` thành công:
  - lưu token
  - gọi `authApi.getMe()`
  - cache profile bằng `updateCachedUserProfile()`
  - rồi mới `navigate()` tới `redirect` hoặc dashboard

- Sau `GoogleCallback` thành công:
  - lưu token
  - gọi `authApi.getMe()`
  - cache profile bằng `updateCachedUserProfile()`
  - rồi mới `navigate()` tới `redirect` hoặc dashboard

Như vậy checkout nhận đúng `avatar + tên + email` ngay lần render đầu khi quay về từ login.

## Component Boundaries

- `Checkout.jsx`: orchestration của stepper, fetch order item, profile state, CTA state
- `CheckoutHeader.jsx`: header tối giản cho checkout
- `CheckoutAccountCard.jsx`: card hiển thị avatar/tên/email và trạng thái gắn course vào account
- `OrderSummary.jsx`: tiếp tục dùng cho course/subscription item nhưng chỉnh visual để đồng bộ hệ thống
- `PriceBreakdown.jsx`: giữ trách nhiệm tính giá, chỉ sửa visual/copy nếu cần

## Error Handling

- Nếu không load được profile nhưng có token:
  - vẫn cho checkout tiếp tục
  - card account hiển thị fallback an toàn `Người dùng SKR` + email rỗng

- Nếu login thành công nhưng `getMe()` fail:
  - không chặn luồng
  - dùng cache/fallback, để checkout tự refresh sau

## Verification

- ESLint cho checkout/auth/profile files
- Production build bằng `npm run build`
- Smoke-check:
  - login -> redirect checkout course -> thấy avatar/tên/email đúng
  - reload checkout vẫn giữ profile
  - step 1/step 2 render đúng layout mới trên desktop và mobile
