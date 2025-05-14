
# Firebase Studio - SalonFlow App

This is a Next.js starter in Firebase Studio for a Salon Booking application.

To get started, take a look at src/app/page.tsx.

## Firebase Setup

Ensure you have a Firebase project created and Firestore enabled.
Your Firebase configuration keys should be placed in a `.env.local` file in the root of your project. See `.env` for the required variable names.

## Important: Firestore Security Rules for Production

The Firestore security rules for this project are located in the `firestore.rules` file in the root of your project. You MUST review and adapt them to your specific needs. 
To apply them:
1. Open the `firestore.rules` file in your code editor.
2. Copy the entire content of this file.
3. Go to your Firebase Console (Firestore Database > Rules tab).
4. Paste the copied rules into the editor, replacing any existing rules.
5. Click **Publish**.

**Key points about these rules:**
*   They attempt to ensure users can only access/modify data relevant to them or their role.
*   They use `get()` calls to check related documents (like user roles or salon ownership). Be mindful that `get()` calls count towards your Firestore read quotas.
*   The rule for staff managing bookings is simplified. In a real app, you'd need a robust way to verify a staff member belongs to the salon of the booking.

**Action for you:**
*   After applying the rules from `firestore.rules` to your Firebase Console, **thoroughly test your application** to ensure all user roles can perform their intended actions and are blocked from unauthorized actions.

**2. Environment Variables for Production**

*   **Never commit `.env.local`:** This file contains your secret keys and should not be in your Git repository or deployment package.
*   **Hosting Provider Settings:** When you deploy to a platform like Vercel (which we'll discuss next), you will configure your environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc.) directly in the Vercel project settings.
    *   Vercel (and similar platforms) will make these variables available to your application at build time and runtime.
    *   The names must match exactly what your application expects (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
    *   Variables starting with `NEXT_PUBLIC_` are exposed to the browser. Any backend-only secrets (if you had them, which we don't extensively in this Firebase-client-heavy app) would not have this prefix.

This covers the first two points. Once you've updated your Firestore rules and understand how environment variables will be handled in production, we can confidently move to discussing deployment with Vercel.

Let me know when you've updated your rules and are ready for the Vercel discussion!
