import { useSearchParams } from 'react-router-dom';
import UnauthorizedPage from '@/shared/guards/UnauthorizedPage';

/**
 * UnauthorizedRoute — Xử lý trang /unauthorized
 * Đọc query param `type` để xác định loại lỗi.
 */
export default function UnauthorizedRoute() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'not_authenticated';

    return <UnauthorizedPage variant={type} />;
}
