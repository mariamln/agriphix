#!/usr/bin/env node
/**
 * Import Base44 CSV exports from Sample Data/ into Firestore (database: agriphix).
 *
 * Prerequisites:
 * 1. Firebase Console → Project settings → Service accounts → Generate new private key
 * 2. Save as firebase-service-account.json (gitignored) in project root
 * 3. export FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
 *
 * Usage:
 *   npm run import:sample-data          # import all CSVs
 *   npm run import:sample-data -- --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readCsvFile } from './parse-csv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SAMPLE_DIR = path.join(ROOT, 'Sample Data');

const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || 'agriphix';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'agriphix';

const IMPORTS = [
  { file: 'UserProfile_export.csv', collection: 'userProfiles' },
  { file: 'Crop_export.csv', collection: 'crops' },
  { file: 'MarketDemand_export.csv', collection: 'marketDemands' },
  { file: 'FinanceRequest_export.csv', collection: 'financeRequests' },
  { file: 'Resource_export.csv', collection: 'resources' },
  { file: 'MarketplaceListing_export.csv', collection: 'marketplaceListings' },
  { file: 'MarketplaceMessage_export.csv', collection: 'marketplaceMessages' },
  { file: 'Shipment_export.csv', collection: 'shipments' },
  { file: 'TraceabilityLog_export.csv', collection: 'traceabilityLogs' },
  { file: 'SustainabilityMetric_export.csv', collection: 'sustainabilityMetrics' },
];

const SKIP_FIELDS = new Set(['created_by_id', 'is_sample']);

const BOOLEAN_FIELDS = new Set([
  'verified',
  'certified',
  'negotiable',
  'read',
  'organic_certified',
  'renewable_energy_used',
]);

const JSON_ARRAY_FIELDS = new Set([
  'certification',
  'user_roles',
  'certifications',
  'certifications_required',
]);

const NUMBER_FIELDS = new Set([
  'land_area',
  'head_count',
  'expected_yield',
  'actual_yield',
  'land_size',
  'quantity_needed',
  'price_per_kg',
  'amount_requested',
  'repayment_period',
  'expected_revenue',
  'price',
  'quantity',
  'views',
  'offered_price',
  'temperature',
  'carbon_footprint_kg',
  'water_usage_liters',
  'pesticide_usage_kg',
  'fertilizer_usage_kg',
  'soil_health_score',
  'biodiversity_score',
  'temperature_high',
  'temperature_low',
  'rainfall_mm',
  'humidity_percent',
]);

function parseBoolean(value) {
  if (value === '' || value == null) return null;
  return String(value).toLowerCase() === 'true';
}

function parseNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseJsonArray(value) {
  if (!value || value === '[]') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function coerceField(key, value) {
  if (value === '') return null;
  if (BOOLEAN_FIELDS.has(key)) return parseBoolean(value);
  if (JSON_ARRAY_FIELDS.has(key)) return parseJsonArray(value);
  if (NUMBER_FIELDS.has(key)) return parseNumber(value);
  return value;
}

function rowToDocument(row) {
  const id = row.id?.trim();
  const doc = {};

  for (const [key, raw] of Object.entries(row)) {
    if (key === 'id' || SKIP_FIELDS.has(key)) continue;
    const value = coerceField(key, raw);
    if (value !== null && value !== undefined && value !== '') {
      doc[key] = value;
    }
  }

  doc.imported_from_sample_data = true;
  doc.legacy_id = id || null;

  return { id, doc };
}

function initFirebase() {
  if (getApps().length > 0) return getFirestore(getApps()[0], DATABASE_ID);

  const credPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(ROOT, 'firebase-service-account.json');

  if (fs.existsSync(credPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || PROJECT_ID,
    });
  } else {
    try {
      initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID,
      });
    } catch {
      console.error(`
Missing Firebase credentials.

Option A — Service account key:
  1. Firebase Console → Project settings → Service accounts → Generate new private key
  2. Save as ${path.join(ROOT, 'firebase-service-account.json')}
  3. Run again

Option B — Application Default Credentials:
  gcloud auth application-default login --project ${PROJECT_ID}
`);
      process.exit(1);
    }
  }

  return getFirestore(getApps()[0], DATABASE_ID);
}

async function importCollection(db, { file, collection }, dryRun) {
  const filePath = path.join(SAMPLE_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Skipping missing file: ${file}`);
    return { collection, count: 0, skipped: true };
  }

  const rows = readCsvFile(filePath);
  const docs = rows.map(rowToDocument).filter((r) => r.id);

  if (dryRun) {
    console.log(`  [dry-run] ${collection}: ${docs.length} documents from ${file}`);
    if (docs[0]) {
      console.log(`    example id: ${docs[0].id}`);
    }
    return { collection, count: docs.length };
  }

  let batch = db.batch();
  let batchCount = 0;
  let total = 0;

  for (const { id, doc } of docs) {
    const ref = db.collection(collection).doc(id);
    batch.set(ref, doc, { merge: true });
    batchCount += 1;
    total += 1;

    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return { collection, count: total };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log(`\nAgriphix sample data import${dryRun ? ' (dry run)' : ''}`);
  console.log(`Project: ${PROJECT_ID}  Database: ${DATABASE_ID}\n`);

  if (!fs.existsSync(SAMPLE_DIR)) {
    console.error(`Sample Data folder not found: ${SAMPLE_DIR}`);
    process.exit(1);
  }

  let db = null;
  if (!dryRun) {
    db = initFirebase();
  }

  const results = [];
  for (const spec of IMPORTS) {
    console.log(`→ ${spec.collection}`);
    results.push(await importCollection(db, spec, dryRun));
  }

  const total = results.reduce((sum, r) => sum + r.count, 0);
  console.log(`\n${dryRun ? 'Would import' : 'Imported'} ${total} documents across ${results.length} collections.`);

  if (!dryRun) {
    console.log('\nNote: WeatherForecast_export.csv is not imported (the app uses live Open-Meteo data).');
    console.log('User accounts are not created — only Firestore records. Sign in with your Firebase Auth user.\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
