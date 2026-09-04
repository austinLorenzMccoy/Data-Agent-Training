# Google Authentication Verification Checklist

✅ **Sign in button has been added to the landing page header** (commit: `47e888c`)

## Verification Steps

### 1. Environment Variables ✅
The following environment variables are already configured in `frontend/.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://lulfjybbiemxogbffqnp.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (configured)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (configured)
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://datanerds-ai-training.vercel.app/`

### 2. Supabase Project Setup
**Status:** ⚠️ **REQUIRES MANUAL VERIFICATION**

Go to your Supabase dashboard at: https://app.supabase.com

1. **Verify Google OAuth Provider is Enabled:**
   - Navigate to **Authentication → Providers**
   - Find **Google** in the list
   - Confirm the toggle is **ON** (blue)
   - If OFF, click to enable it

2. **Check Google OAuth Configuration:**
   - In the Google provider settings, you should see fields for:
     - **Client ID** (from Google Cloud Console)
     - **Client Secret** (from Google Cloud Console)
   - Both must be filled in for authentication to work

3. **Verify Redirect URLs:**
   - Check that the following redirect URI is authorized in your Google Cloud Console:
     ```
     https://lulfjybbiemxogbffqnp.supabase.co/auth/v1/callback
     ```
   - For local development, also add:
     ```
     http://localhost:3000/auth/callback
     ```

### 3. Backend Implementation ✅
All backend authentication code is properly configured:

- ✅ `lib/supabase/server.ts` - Server-side Supabase client initialized
- ✅ `lib/supabase/client.ts` - Browser-side Supabase client initialized
- ✅ `contexts/AuthContext.tsx` - Google OAuth integration with `signInWithGoogle()`
- ✅ `app/auth/callback/route.ts` - Auth callback handler to exchange OAuth code for session
- ✅ `components/auth/login-form.tsx` - Login form with Google button
- ✅ `components/landing/landing-hero.tsx` - Landing page sign in button

### 4. Frontend Implementation ✅
Sign in flow is properly implemented:

- ✅ Landing page header with sign in button
- ✅ Full login page at `/login`
- ✅ OAuth redirect handling via `/auth/callback`
- ✅ Session persistence and user state management
- ✅ Dashboard link for authenticated users

### 5. Test the Authentication Flow

1. **Start the development server:**
   ```bash
   cd frontend && pnpm dev
   ```

2. **Visit the landing page:**
   - Open http://localhost:3000
   - You should see the "Sign in" button in the top-right header

3. **Click the Sign in button:**
   - Button should redirect to Google OAuth login
   - After approving, you should return to the dashboard (`/training`)
   - Your email should appear in the landing page header

4. **Verify session persistence:**
   - Reload the page
   - User should remain logged in
   - Email should still show in header

5. **Test logout:**
   - Navigate to `/dossier` (Progress page)
   - Click "Log out" button
   - Should redirect to landing page
   - Sign in button should reappear

## Google Cloud Console Setup (if not already done)

If Google OAuth is not yet configured, follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth 2.0 Client ID**
6. Select **Web application**
7. Add authorized redirect URIs:
   ```
   https://lulfjybbiemxogbffqnp.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
8. Copy **Client ID** and **Client Secret**
9. Go back to Supabase dashboard
10. Navigate to **Authentication → Providers → Google**
11. Paste Client ID and Client Secret
12. Click Save

## Troubleshooting

### Issue: "Authentication failed" error
- Check that Google OAuth Client ID and Secret are correctly entered in Supabase
- Verify redirect URIs are authorized in Google Cloud Console
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Issue: Sign in button doesn't respond
- Check browser console for errors
- Verify Supabase credentials are set in `.env.local`
- Ensure the Google provider is enabled in Supabase

### Issue: After sign in, redirects back to `/` instead of `/training`
- Check `auth/callback/route.ts` is present
- Verify the `next` query parameter is being passed correctly
- Check browser cookies are not blocked

### Issue: User logs out but session persists
- Clear browser cache and cookies for localhost:3000
- Check `localStorage` is not blocked
- Verify `NEXT_PUBLIC_SITE_URL` matches current URL

## Related Files

- **Authentication Context:** `contexts/AuthContext.tsx`
- **Auth Callback Handler:** `app/auth/callback/route.ts`
- **Login Form:** `components/auth/login-form.tsx`
- **Landing Hero:** `components/landing/landing-hero.tsx`
- **Supabase Server Client:** `lib/supabase/server.ts`
- **Supabase Browser Client:** `lib/supabase/client.ts`

## Additional Resources

- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Google OAuth Setup: https://supabase.com/docs/guides/auth/social-login/auth-google
- Next.js Auth Patterns: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
