rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow users to read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to book and view bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
  }
}
