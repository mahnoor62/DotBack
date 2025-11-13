## DotBack Admin Dashboard

DotBack is a single-page administrative dashboard built with Next.js (App Router), MongoDB, and Material UI. It lets an administrator configure 10 DotBack levels, each with custom background colors, dot palettes, and branded logos. Authentication is handled server-side with signed cookies and MongoDB-stored credentials.

### Tech Stack

- Next.js App Router with server components
- MongoDB via Mongoose
- Material UI v5 with custom light/dark themes
- JSON Web Tokens stored as HTTP-only cookies

### Project Structure Overview

- `app/` – App Router pages and API routes (`/api/auth`, `/api/levels`, `/api/upload`)
- `components/` – Reusable UI modules (dashboard, auth, layout, theme registry)
- `lib/` – Database connection, auth helpers, initial seed logic, level services
- `models/` – Mongoose schemas (`Admin`, `LevelConfig`)
- `public/uploads/` – Local logo uploads (auto-created)

### Prerequisites

- Node.js 18+
- MongoDB running locally (`MONGO_URL=mongodb://127.0.0.1:27017/DotBack`)

### Environment Variables

Create a `.env.local` file at the project root:

```
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=change_me_to_a_secure_secret
```

`JWT_SECRET` should be a long, random string. `MONGO_URL` defaults to the value above if omitted.

### Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Default Admin & Data Seeding

During the first request the app seeds MongoDB with the default admin credentials only:

- Email: `admin@dotback.com`  
- Password: `dotback123`

Create levels directly from the dashboard; each new level is stored immediately. Change the seeded admin password after launching in production by updating the database record (or adjust the default in `lib/seed.js` before deployment).

### Local Logo Uploads

Uploaded logos are persisted to `public/uploads` and referenced via relative URLs (e.g. `/uploads/123-logo.png`). When deploying to serverless platforms, replace the upload implementation with persistent storage (S3, Cloudinary, etc.).

### Scripts

- `npm run dev` – Start development server
- `npm run build` – Create production build
- `npm start` – Run production server
- `npm run lint` – Run Next.js / ESLint checks

### Notes

- The dashboard is portrait-friendly and responsive, optimized for 1080×1920 layouts.
- Authentication restricts API and page access to the signed-in admin.
- Theme preference (light/dark) persists across sessions via localStorage.
- MongoDB indexes are created through Mongoose schema definitions.
