import assert from "node:assert/strict";
import {
  getDocumentPreviewStrategy,
  resolveDocumentUrl,
} from "../src/features/expert/utils/documentPreview.js";

const origin = "http://localhost:5173";

assert.equal(
  resolveDocumentUrl("/uploads/documents/lesson.docx", origin),
  "http://localhost:5173/uploads/documents/lesson.docx",
);

const docxStrategy = getDocumentPreviewStrategy(
  {
    fileUrl: "/uploads/documents/lesson.docx",
    fileType: "docx",
    fileName: "lesson.docx",
  },
  origin,
);

assert.equal(
  docxStrategy.kind,
  "docx",
  `Expected local DOCX uploads to use in-app DOCX rendering, got "${docxStrategy.kind}"`,
);

const pdfStrategy = getDocumentPreviewStrategy(
  {
    fileUrl: "/uploads/documents/lesson.pdf",
    fileType: "pdf",
    fileName: "lesson.pdf",
  },
  origin,
);

assert.equal(pdfStrategy.kind, "iframe");
assert.equal(pdfStrategy.src, "http://localhost:5173/uploads/documents/lesson.pdf");

const driveStrategy = getDocumentPreviewStrategy(
  {
    fileUrl: "https://drive.google.com/file/d/abc123/view?usp=sharing",
    fileType: "docx",
    fileName: "drive.docx",
  },
  origin,
);

assert.equal(driveStrategy.kind, "iframe");
assert.equal(
  driveStrategy.src,
  "https://drive.google.com/file/d/abc123/preview",
);

console.log("Document preview strategy chooses local DOCX rendering correctly.");
