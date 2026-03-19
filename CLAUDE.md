# Claude Opus Instructions for SKR-frontend

## Development Philosophy (Based on Superpowers)

### TDD - Test Driven Development
- Always write tests before implementing new features
- Follow RED-GREEN-REFACTOR cycle:
  1. RED: Write failing test first
  2. GREEN: Write minimal code to pass test
  3. REFACTOR: Improve code while keeping tests passing

### Systematic Debugging
- When debugging, reproduce the issue first
- Use systematic approach: identify root cause, not symptoms
- Verify fix works before declaring success

### Code Review Checklist (Before completing any task)
- [ ] Code follows existing patterns in the project
- [ ] No security vulnerabilities introduced
- [ ] Error handling is appropriate
- [ ] Code is clean and readable
- [ ] Tests pass (if tests exist)

### Workflow
1. Understand the requirement fully before coding
2. Plan the implementation with specific file paths
3. Implement with TDD approach when possible
4. Review code before marking task complete

## Project-Specific Notes

### Vietnamese Language
- All user-facing text must be in Vietnamese
- Use proper Vietnamese characters (àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ)
- NEVER use Unicode escape sequences like \u1ED9 - use actual Vietnamese characters

### Tech Stack
- React + Vite
- Tailwind CSS
- Motion (framer-motion)
- Axios for API calls

### API Conventions
- Use axiosClient from @/shared/api/axiosClient
- API endpoints return response.data (handled by interceptor)
- Use async/await for all API calls
