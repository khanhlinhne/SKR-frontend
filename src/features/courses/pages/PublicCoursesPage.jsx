import Courses from './Courses';
import { HomeNavBar, HomeFooter } from '@/features/home/components';

export default function PublicCoursesPage() {
    return (
        <div className="apple-home apple-transition flex min-h-screen flex-col">
            <HomeNavBar />
            <div className="flex-1">
                <Courses layout="public" initialShowAll={true} showHighlightSections={false} />
            </div>
            <HomeFooter />
        </div>
    );
}
