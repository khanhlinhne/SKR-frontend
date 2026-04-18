import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MoonStar, SunMedium } from 'lucide-react';

const STORAGE_KEY = 'theme';

function applyTheme(nextTheme) {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
}

export default function HomeThemeToggle() {
    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light');

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const isDark = theme === 'dark';

    return (
        <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="apple-theme-toggle apple-transition inline-flex h-11 w-11 items-center justify-center rounded-full"
        >
            {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </motion.button>
    );
}
