
# Firebase Studio - SalonFlow App

This is a Next.js starter in Firebase Studio for a Salon Booking application.

To get started, take a look at src/app/page.tsx.

## Firebase Setup

Ensure you have a Firebase project created and Firestore enabled.
Your Firebase configuration keys should be placed in a `.env.local` file in the root of your project. See `.env` for the required variable names.

## Important: Firestore Security Rules for Production

The following security rules are recommended as a starting point for a more secure production environment. You MUST review and adapt them to your specific needs. Update these in your Firebase Console (Firestore Database > Rules).

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users:
    // - Anyone can create their own user profile document (e.g., during signup).
    // - Only the authenticated user can read or update their own profile.
    // - Deletion of user profiles should ideally be handled by admin/server functions.
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Prevent client-side deletion
    }

    // Salons:
    // - Anyone can read salon listings and details.
    // - Only authenticated users whose role is 'owner' (as per their /users/{uid} doc) can create salons.
    //   The new salon's ownerUid must match the creator's UID.
    // - Only the authenticated owner of a salon (ownerUid matches request.auth.uid) can update or delete it.
    match /salons/{salonId} {
      allow read: if true;
      allow create: if request.auth != null &&
                       request.resource.data.ownerUid == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
      allow update: if request.auth != null &&
                       resource.data.ownerUid == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
                       // Ensure ownerUid cannot be changed by the update
                       // && request.resource.data.ownerUid == resource.data.ownerUid;
      allow delete: if request.auth != null &&
                       resource.data.ownerUid == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
    }

    // Services (Global specific services that salons can categorize):
    // - Anyone can read services.
    // - Only authenticated 'owners' or 'staff' can create, update, or delete services.
    //   (Consider if staff should only manage services for their specific salon if services become salon-specific)
    match /services/{serviceId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
                                     (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner' ||
                                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff');
    }

    // Staff:
    // - Anyone can read staff details (e.g., for booking).
    // - Only authenticated 'owners' can create staff, and the staff's salonId must match a salon they own.
    // - Only authenticated 'owners' can update/delete staff from a salon they own.
    match /staff/{staffId} {
      allow read: if true;
      function isSalonOwner(uid, salonId) {
        return get(/databases/$(database)/documents/users/$(uid)).data.role == 'owner' &&
               get(/databases/$(database)/documents/salons/$(salonId)).data.ownerUid == uid;
      }
      allow create: if request.auth != null &&
                       isSalonOwner(request.auth.uid, request.resource.data.salonId);
      allow update: if request.auth != null &&
                       isSalonOwner(request.auth.uid, resource.data.salonId) &&
                       // Optionally prevent changing the salonId of an existing staff member
                       request.resource.data.salonId == resource.data.salonId;
      allow delete: if request.auth != null &&
                       isSalonOwner(request.auth.uid, resource.data.salonId);
    }

    // Bookings:
    // - Authenticated users can create bookings for themselves.
    // - Customers can read/update/delete their own bookings (customerEmail matches their auth email).
    // - Owners/Staff of the booked salon can read/update/delete bookings for that salon.
    match /bookings/{bookingId} {
      allow create: if request.auth != null &&
                       request.resource.data.customerEmail == request.auth.token.email; // Customer creates their own booking

      function isBookingCustomer() {
        return request.auth != null && request.auth.token.email == resource.data.customerEmail;
      }
      function isStaffOrOwnerOfBookedSalon() {
        if (request.auth == null) return false;
        let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
        let userRole = userDoc.role;
        // This assumes staff members have a user document and their UID is used in a `staff` collection
        // where their `salonId` is stored. A more direct link from user to staff profile might be needed
        // for a cleaner rule if staff members don't have a global user role indicating "staff".
        // For now, we'll assume the staff role is on the user document.
        // We also need to verify the staff member actually belongs to the salon in question.
        // A staff member's salonId needs to be easily accessible via their auth.uid.
        // For simplicity here, we'll check if the user is an owner of the salon. A real staff rule would be more complex.
        // It's better to check if owner or staff member's UID is associated with the salonId of the booking.

        let salonDoc = get(/databases/$(database)/documents/salons/$(resource.data.salonId)).data;
        if (userRole == 'owner' && salonDoc.ownerUid == request.auth.uid) {
          return true;
        }
        // For staff, you would typically check if the staff member (request.auth.uid) belongs to resource.data.salonId
        // This might involve another `get()` to a staff collection or a list of staff UIDs on the salon document.
        // If a staff user has their salonId on their user profile:
        // if (userRole == 'staff' && userDoc.assignedSalonId == resource.data.salonId) return true;
        return false; // Simplified for now. Staff access rule needs refinement based on your data model.
      }
      allow read, update, delete: if isBookingCustomer() || isStaffOrOwnerOfBookedSalon();
    }
  }
}
```

**Key points about these rules:**
*   They try to ensure users can only access/modify data relevant to them or their role.
*   They use `get()` calls to check related documents (like user roles or salon ownership). Be mindful that `get()` calls count towards your Firestore read quotas.
*   The rule for staff managing bookings is simplified. In a real app, you'd need a more robust way to verify a staff member belongs to the salon of the booking.

**Action for you:**
*   Go to your Firebase Console -> Firestore Database -> Rules tab.
*   Replace your current rules with the ones provided above.
*   Click **Publish**.
*   **Thoroughly test your application** to ensure all user roles can perform their intended actions and are blocked from unauthorized actions.

**2. Environment Variables for Production**

*   **Never commit `.env.local`:** This file contains your secret keys and should not be in your Git repository or deployment package.
*   **Hosting Provider Settings:** When you deploy to a platform like Vercel (which we'll discuss next), you will configure your environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc.) directly in the Vercel project settings.
    *   Vercel (and similar platforms) will make these variables available to your application at build time and runtime.
    *   The names must match exactly what your application expects (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
    *   Variables starting with `NEXT_PUBLIC_` are exposed to the browser. Any backend-only secrets (if you had them, which we don't extensively in this Firebase-client-heavy app) would not have this prefix.

This covers the first two points. Once you've updated your Firestore rules and understand how environment variables will be handled in production, we can confidently move to discussing deployment with Vercel.

Let me know when you've updated your rules and are ready for the Vercel discussion!