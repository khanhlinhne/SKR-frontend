# SKR Backend (Auth)

Simple Express backend to support Login/SignUp pages in the SKR frontend.

Quick start:

1. Copy env file:

   cp .env.example .env
   (Windows: copy .env.example .env)

2. Install deps and run:

   cd server
   npm install
   npm run dev

3. Server runs at http://localhost:4000

Endpoints:

- POST /api/auth/signup  { name, email, password }
- POST /api/auth/login   { email, password }
- GET  /api/auth/me      (Authorization: Bearer <token>)

Notes:
- Uses a small JSON database (lowdb) stored in `data.json` in server dir (no native build tools required).
- Change JWT secret in .env for production.
