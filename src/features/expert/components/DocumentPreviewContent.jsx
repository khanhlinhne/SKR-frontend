import { useEffect, useState } from 'react';
import mammoth from 'mammoth/mammoth.browser';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { getDocumentPreviewStrategy } from '@/features/expert/utils/documentPreview';

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildPreviewFrameHtml(title, body) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title || 'Document preview')}</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Georgia, "Times New Roman", serif;
      background: #f6f4ef;
      color: #171717;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 28%),
        linear-gradient(180deg, #faf8f2 0%, #f3efe6 100%);
      padding: 32px;
    }
    .page {
      max-width: 860px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(23, 23, 23, 0.08);
      border-radius: 24px;
      padding: 40px 48px;
      box-shadow: 0 24px 70px rgba(23, 23, 23, 0.12);
    }
    .page h1, .page h2, .page h3, .page h4, .page h5, .page h6 {
      line-height: 1.2;
      margin-top: 1.6em;
      margin-bottom: 0.6em;
      font-family: "Segoe UI", system-ui, sans-serif;
    }
    .page p, .page li, .page td, .page th, .page blockquote {
      font-size: 16px;
      line-height: 1.75;
    }
    .page img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
    }
    .page table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      overflow: hidden;
      border-radius: 16px;
    }
    .page th, .page td {
      border: 1px solid rgba(23, 23, 23, 0.1);
      padding: 12px 14px;
      vertical-align: top;
    }
    .page pre {
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
      font-size: 14px;
      line-height: 1.7;
    }
    .page blockquote {
      margin: 24px 0;
      padding: 16px 20px;
      border-left: 4px solid #10b981;
      background: rgba(16, 185, 129, 0.08);
      border-radius: 16px;
    }
  </style>
</head>
<body>
  <main class="page">${body}</main>
</body>
</html>`;
}

function buildTextPreviewHtml(title, text) {
    return buildPreviewFrameHtml(
        title,
        `<pre>${escapeHtml(text)}</pre>`,
    );
}

function buildDocxPreviewHtml(title, html) {
    const content = html?.trim() || '<p>Tài liệu không có nội dung để hiển thị.</p>';
    return buildPreviewFrameHtml(title, content);
}

function LoadingState({ label }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300/60">
            <div className="text-center space-y-3 px-6">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-base-content/60">{label}</p>
            </div>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300/60 px-6">
            <div className="max-w-md text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-base-content/70">{message}</p>
                <p className="text-xs text-base-content/45">
                    Bạn vẫn có thể mở link gốc ở góc trên để xem hoặc tải tài liệu.
                </p>
            </div>
        </div>
    );
}

export default function DocumentPreviewContent({ document }) {
    const [state, setState] = useState({ status: 'idle', strategy: null, html: null, error: null });

    useEffect(() => {
        let active = true;
        const strategy = getDocumentPreviewStrategy(document);

        async function loadPreview() {
            if (strategy.kind === 'iframe') {
                if (active) {
                    setState({ status: 'ready', strategy, html: null, error: null });
                }
                return;
            }

            if (strategy.kind === 'docx') {
                if (active) {
                    setState({ status: 'loading', strategy, html: null, error: null });
                }

                try {
                    const response = await fetch(strategy.src);
                    if (!response.ok) {
                        throw new Error('Không thể tải file DOCX để xem trước.');
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer });

                    if (active) {
                        setState({
                            status: 'ready',
                            strategy,
                            html: buildDocxPreviewHtml(document?.documentTitle, result.value),
                            error: null,
                        });
                    }
                } catch {
                    if (active) {
                        setState({
                            status: 'error',
                            strategy,
                            html: null,
                            error: 'Không thể dựng xem trước cho file DOCX này.',
                        });
                    }
                }
                return;
            }

            if (strategy.kind === 'text') {
                if (active) {
                    setState({ status: 'loading', strategy, html: null, error: null });
                }

                try {
                    const response = await fetch(strategy.src);
                    if (!response.ok) {
                        throw new Error('Không thể tải file văn bản để xem trước.');
                    }

                    const text = await response.text();
                    if (active) {
                        setState({
                            status: 'ready',
                            strategy,
                            html: buildTextPreviewHtml(document?.documentTitle, text),
                            error: null,
                        });
                    }
                } catch {
                    if (active) {
                        setState({
                            status: 'error',
                            strategy,
                            html: null,
                            error: 'Không thể đọc nội dung file văn bản này.',
                        });
                    }
                }
                return;
            }

            if (active) {
                setState({
                    status: 'error',
                    strategy,
                    html: null,
                    error: 'Định dạng này chưa hỗ trợ xem trước trực tiếp trong hệ thống.',
                });
            }
        }

        loadPreview();
        return () => {
            active = false;
        };
    }, [document]);

    if (state.status === 'loading') {
        const label = state.strategy?.kind === 'docx'
            ? 'Đang dựng xem trước DOCX...'
            : 'Đang tải nội dung tài liệu...';
        return <LoadingState label={label} />;
    }

    if (state.status === 'error') {
        return <ErrorState message={state.error} />;
    }

    if (state.html) {
        return (
            <iframe
                srcDoc={state.html}
                className="w-full h-full bg-white"
                title={document?.documentTitle || 'Document preview'}
                sandbox=""
            />
        );
    }

    if (state.strategy?.kind === 'iframe') {
        return (
            <iframe
                src={state.strategy.src}
                className="w-full h-full"
                title={document?.documentTitle || 'Document preview'}
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300/60 px-6">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-base-content/60">
                    Chưa có dữ liệu xem trước cho tài liệu này.
                </p>
            </div>
        </div>
    );
}
