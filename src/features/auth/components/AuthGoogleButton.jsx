function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.25-.2-1.8H12v3.4h5.52c-.1.84-.64 2.1-1.84 2.95l-.02.11 2.7 2.09.19.02c1.78-1.64 2.81-4.06 2.81-6.77Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.15-2.44c-.84.59-1.96 1-3.47 1-2.64 0-4.88-1.73-5.69-4.12l-.1.01-2.81 2.17-.03.1A9.99 9.99 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.31 14.01A5.98 5.98 0 0 1 5.98 12c0-.7.12-1.38.32-2l-.01-.14-2.84-2.2-.09.04A9.96 9.96 0 0 0 2 12c0 1.6.38 3.11 1.36 4.3l2.95-2.29Z" />
            <path fill="#EA4335" d="M12 5.87c1.9 0 3.18.82 3.91 1.5l2.86-2.8C16.95 2.88 14.7 2 12 2a9.99 9.99 0 0 0-8.64 4.7l2.94 2.3C7.12 6.6 9.36 5.87 12 5.87Z" />
        </svg>
    );
}

export default function AuthGoogleButton({ onClick, disabled = false, children = 'Tiếp tục với Google' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="apple-auth-outline-button apple-transition inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl text-sm font-semibold disabled:opacity-60"
        >
            <GoogleIcon />
            <span>{children}</span>
        </button>
    );
}
