import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

const STORAGE_KEY = 'theme';

function applyTheme(nextTheme) {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
}

export default function ThemeController({ className = '' }) {
    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light');

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-base-300 bg-base-100/80 text-base-content transition-colors hover:bg-base-200 ${className}`.trim()}
        >
            {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
    );
}
