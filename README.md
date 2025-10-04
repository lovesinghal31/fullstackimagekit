<div align="center">
	<h1>Fullstack ImageKit / Video Upload Platform</h1>
	<p><strong>Next.js 15 (App Router) • NextAuth • ImageKit • Mongoose • Zod • React Hook Form • Axios • Tailwind</strong></p>
</div>

## 🧭 Overview
This application provides user authentication (credentials + GitHub OAuth), secure server‑side generation of ImageKit upload authentication parameters, immediate (client-side) video upload to ImageKit with progress feedback, and persistent storage of video metadata (title, description, URLs) in MongoDB. A hosted upload pattern ("Pattern A") is implemented: the file is uploaded first; the form then submits only metadata + the hosted URL.

## ✨ Key Features
- User registration & login (NextAuth credentials + GitHub OAuth)
- JWT session strategy with user `id` injected into `session.user`
- Protected video creation endpoint (`/api/videos`)
- Immediate client-side upload through ImageKit (`FileUpload` component) with progress tracking
- Validation via Zod (form + hosted schema) and react-hook-form resolvers
- MongoDB persistence with Mongoose models (`User`, `Video`)
- Toast notifications (Sonner) & custom notification provider
- Centralized Axios API client (`api-client.ts`)
- Environment-driven configuration with graceful runtime checks
- Modular UI components (Buttons, Inputs, Dialog, etc.) based on shadcn/ui style

## 🏗️ Architecture
| Layer | Responsibility | Notable Files |
|-------|----------------|---------------|
| Auth | Session, providers, callbacks | `src/lib/auth.ts`, `src/types/next-auth.d.ts` |
| Data | DB connection & models | `src/lib/dbConnect.ts`, `src/models/User.ts`, `src/models/Video.ts` |
| API | RESTful routes | `src/app/api/auth/*`, `src/app/api/videos/route.ts`, `src/app/api/imagekit-auth/route.ts` |
| Upload | ImageKit integration | `src/components/FileUpload.tsx`, `src/app/api/imagekit-auth/route.ts` |
| Forms | Validation & handling | `src/schemas/*`, `VideoUploadForm.tsx` |
| UI | Reusable components | `src/components/ui/*` |

### Upload Flow (Pattern A)
1. User selects a video in `FileUpload`.
2. Component requests auth params from `/api/imagekit-auth` (server-side, uses private key).
3. ImageKit `upload()` runs in the browser → returns `fileId`, `url`, metadata.
4. Form stores `videoUrl` + `fileId` (Zod: `videoUploadHostedSchema`).
5. User completes title & description and submits.
6. Backend `/api/videos` validates required metadata and persists the document.

## 🗂️ Folder Structure (excerpt)
```
src/
	app/
		api/
			auth/...           # NextAuth credential + register endpoints
			imagekit-auth/     # GET: ImageKit upload auth params
			videos/            # GET/POST video metadata
		login/               # Login page (credentials + GitHub)
		register/            # Registration page
		profile/             # Displays session user id/email
	components/
		FileUpload.tsx       # Immediate ImageKit uploader
		VideoUploadForm.tsx  # Pattern A form
		ui/                  # Reusable primitives
	context/
		AuthProvider.tsx     # Session + ImageKit + Notifications
	lib/
		auth.ts              # NextAuth options
		api-client.ts        # Axios wrapper
		dbConnect.ts         # Mongoose connection caching
	models/                # Mongoose models (User, Video)
	schemas/               # Zod schemas (login, register, video upload)
	types/                 # Shared TypeScript types
```

## 🔐 Environment Variables
Create a `.env.local` with the following (example names—adjust as necessary):

```bash
NEXTAUTH_SECRET=your_long_random_secret
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=fullstack_imagekit
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

All variables prefixed with `NEXT_PUBLIC_` are exposed to the client; keep private keys server-only.

## 🚀 Getting Started
Install dependencies and run the dev server:

```bash
npm install
npm run dev
# http://localhost:3000
```

## 🧪 Validation & Types
- Zod schemas in `src/schemas/`
	- `videoUploadSchema` (raw File client validation – legacy / optional)
	- `videoUploadHostedSchema` (Pattern A – validates `videoUrl`, `fileId`)
- Type augmentation for NextAuth in `src/types/next-auth.d.ts` ensures `session.user.id` exists.

## 📡 API Endpoints (Summary)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/auth/register` | Create user | Public |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth (credentials, GitHub) | Mixed |
| GET | `/api/imagekit-auth` | Get upload auth params (signature) | Server only (no session required) |
| GET | `/api/videos` | List videos (sorted newest first) | Public (could restrict later) |
| POST | `/api/videos` | Persist uploaded video metadata | Requires session |

## 🧰 Important Components
### `FileUpload`
Props: `onSuccess`, `onProgress?`, `fileType?="image" | "video"`.
Returns an `ImageKitUploadResponse` with `fileId`, `url`, size & basic metadata.

### `VideoUploadForm`
Uses `videoUploadHostedSchema` + `FileUpload` to send metadata after successful client upload.

## 🗄️ Data Model (Video)
```ts
interface IVideo {
	title: string;
	description: string;
	videoUrl: string;
	thumbnailUrl: string;
	fileId?: string; // ImageKit identifier
	controls?: boolean; // default true
	transformation?: { height: number; width: number; quality?: number };
	createdAt?: Date; updatedAt?: Date;
}
```

## 🔄 Session & Auth
- JWT strategy; user `id` stored on token then merged into session.
- Credentials login: bcrypt password compare.
- GitHub OAuth provider for quick social login.

## 🧩 Axios API Client
`src/lib/api-client.ts` centralizes requests with error normalization; `createVideo()` and `getVideos()` wrappers are available.

## 🛡️ Error Handling & Notifications
- Toasts via Sonner (`<Toaster />` in root layout) with dismiss actions.
- Upload errors categorized (abort, invalid request, server, network).

## 🧱 Styling
- Tailwind CSS + shadcn-inspired UI components.
- Geist font via `next/font`.

## 🔮 Future Improvements
- Generate dynamic thumbnails (ImageKit transformation query params)
- Add pagination / infinite scroll to video feed
- Role-based access control (admin moderation)
- Rate limiting for API endpoints
- Add optimistic UI & retry for uploads
- Server-side video processing hooks (webhooks from ImageKit)
- Dark/light theme toggle (themes provider present but can be enhanced)

## ✅ Checklist for New Environment
1. Populate `.env.local` with all variables
2. Ensure MongoDB connectivity
3. Create ImageKit account & keys (private + public + URL endpoint)
4. Set `NEXTAUTH_SECRET` (can be generated with `openssl rand -base64 32`)
5. Start dev server and register a test user
6. Upload a sample video to verify `/api/imagekit-auth` and `/api/videos`

## 📜 License
MIT (add a LICENSE file if distributing publicly)

---
Feel free to open issues or extend the stack with additional media features. Happy hacking! 🎥
