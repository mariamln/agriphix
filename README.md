# Agriphix

Uganda's halal agriculture platform — market coordination, riba-free financing, traceability, and value chain tools.

## Development

```bash
npm install
cp .env.example .env   # add Firebase project keys from Firebase Console
npm run dev
```

Open http://localhost:5173

### Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → **Email/Password** and **Google** sign-in providers
3. Create a **Firestore** database and **Storage** bucket
4. Copy web app config into `.env` (see `.env.example`)
5. Deploy security rules: `firebase deploy --only firestore:rules,storage`

### Import sample data (CSV → Firestore)

CSV exports from the original platform live in `Sample Data/`. To load them into Firestore:

1. Firebase Console → **Project settings** → **Service accounts** → **Generate new private key**
2. Save the JSON file as `firebase-service-account.json` in the project root (gitignored)
3. Preview: `npm run import:sample-data:dry`
4. Import: `npm run import:sample-data`

This writes documents with their original IDs into the `agriphix` database collections (`crops`, `userProfiles`, `marketDemands`, etc.). It does **not** create Firebase Auth users — sign in with your own account after import.

## Build

```bash
npm run build
npm run preview
```
