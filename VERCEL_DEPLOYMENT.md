# Blinkstar Properties Vercel Deployment

This repository is best deployed as two separate Vercel projects:

- `frontend`
- `backend`

## 1. Frontend Project

- Import the repo into Vercel.
- Set the project root to `frontend`.
- Build command: `npm run build`
- Output directory: `build`

Environment variables:

- `REACT_APP_API_URL=https://your-backend-domain.vercel.app`

The frontend already includes `frontend/vercel.json` so React Router routes work on refresh.

## 2. Backend Project

- Import the same repo into Vercel again.
- Set the project root to `backend`.

Environment variables:

- `MONGO_URI`
- `MONGODB_URI` if you are using the native Atlas/Vercel integration instead of `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- `CORS_ORIGINS=https://your-frontend-domain.vercel.app`
- `EMAIL_USER`
- `EMAIL_PASS`

The backend already includes `backend/vercel.json` and routes all requests through `api/index.js`.

After changing backend environment variables in Vercel, redeploy the backend project so the new values are applied.

## 3. MongoDB Atlas

- Add your Atlas connection string as `MONGO_URI` in the backend Vercel project.
- If the Atlas/Vercel integration gives you `MONGODB_URI`, the backend will accept that too.
- Make sure the database user has access to the correct database.
- Allow Atlas network access for Vercel traffic. The simplest setup is `0.0.0.0/0`.

## 4. Important Upload Note

This app currently stores property images in a local `uploads/` folder.

That works locally, but it is not durable on Vercel serverless functions.

For production image uploads, move storage to one of these:

- Cloudinary
- Amazon S3
- Vercel Blob

Until then, property image uploads may not persist correctly after deployment.
