# PageTurner — Local Run and Deployment Guide

## What was fixed
- Improved environment variable detection in `js/config.js`.
- Fixed drag-and-drop upload so dropped files populate the upload inputs.
- Updated PDF storage handling for private Supabase `books-pdf` uploads by storing object paths and resolving signed URLs in the reader.
- Added safer admin approval error handling.
- Verified routing uses clean URLs for `/dashboard`, `/admin`, and `/reader` via `vercel.json`.

---

## Local setup

### 1. Configure Supabase
1. Create a Supabase project.
2. Run `supabase_schema.sql` in the Supabase SQL editor.
3. Create storage buckets:
   - `books-pdf` → private
   - `book-covers` → public
4. Add any required RLS/storage policies as noted in `supabase_schema.sql`.

### 2. Configure credentials
Open `js/config.js` and replace placeholder values with your Supabase/EmailJS credentials.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_EMAIL`
- `EMAILJS_SERVICE_ID` (optional)
- `EMAILJS_TEMPLATE_ID` (optional)
- `EMAILJS_PUBLIC_KEY` (optional)

> If you run locally without replacing these values, the app will warn in the browser console.

### 3. Run a local static server
This is a static HTML/JS project, so you can use any simple server.

#### Option A: Vercel Dev (recommended)
```powershell
npm install -g vercel
vercel dev
```
Then visit `http://localhost:3000`

#### Option B: Python HTTP server
```powershell
python -m http.server 3000
```
Then visit `http://localhost:3000/index.html`

#### Option C: Node static server
```powershell
npx http-server . -p 3000
```

### 4. Access the app
- Login page: `/index.html`
- Dashboard: `/pages/dashboard.html` or `/dashboard` when using `vercel dev`
- Admin page: `/pages/admin.html` or `/admin` when using `vercel dev`
- Reader page: `/upload/reader.html?id=<book-id>` or `/reader?id=<book-id>` with `vercel dev`

---

## How to test locally
1. Start the local server.
2. Open `/index.html` in your browser.
3. Sign up or sign in with Supabase credentials.
4. Test dashboard features:
   - search/filter books
   - wishlist
   - upload request
   - view my uploads
5. Test admin features (admin user):
   - review pending requests
   - approve/reject requests
   - upload books directly
6. Test reading a book:
   - click `Read Now`
   - navigate pages
   - add notes and bookmarks

---

## Notes
- The app is static and does not need `npm install` unless you want `vercel` or a helper server.
- The reader uses Supabase signed URLs for private book PDFs.
- If you prefer, run with `vercel dev` so rewrite routes like `/dashboard`, `/admin`, and `/reader` work exactly like deployment.
