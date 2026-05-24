import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  limit as fsLimit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const COLLECTIONS = {
  Crop: 'crops',
  UserProfile: 'userProfiles',
  MarketDemand: 'marketDemands',
  FinanceRequest: 'financeRequests',
  MarketplaceListing: 'marketplaceListings',
  MarketplaceMessage: 'marketplaceMessages',
  Message: 'messages',
  Shipment: 'shipments',
  TraceabilityLog: 'traceabilityLogs',
  HalalCertification: 'halalCertifications',
  SustainabilityMetric: 'sustainabilityMetrics',
  Resource: 'resources',
};

function serializeValue(value) {
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return value;
}

function docToEntity(id, data) {
  const entity = { id, ...data };
  for (const key of Object.keys(entity)) {
    entity[key] = serializeValue(entity[key]);
  }
  return entity;
}

function sortEntities(items, sortSpec) {
  const desc = sortSpec.startsWith('-');
  const field = desc ? sortSpec.slice(1) : sortSpec;
  return [...items].sort((a, b) => {
    const av = a[field] ?? a.created_date ?? '';
    const bv = b[field] ?? b.created_date ?? '';
    if (av === bv) return 0;
    if (av > bv) return desc ? -1 : 1;
    return desc ? 1 : -1;
  });
}

export function createEntityApi(entityName) {
  const collectionName = COLLECTIONS[entityName];
  if (!collectionName) {
    throw new Error(`Unknown entity: ${entityName}`);
  }

  const col = () => collection(db, collectionName);

  return {
    async list(sortSpec = '-created_date', limitCount = 100) {
      const snap = await getDocs(query(col(), fsLimit(Math.min(limitCount, 500))));
      const items = snap.docs.map((d) => docToEntity(d.id, d.data()));
      return sortEntities(items, sortSpec).slice(0, limitCount);
    },

    async create(data) {
      const user = auth.currentUser;
      const payload = {
        ...data,
        created_by: user?.email ?? data.created_by ?? null,
        created_date: serverTimestamp(),
        updated_date: serverTimestamp(),
      };
      const ref = await addDoc(col(), payload);
      return { id: ref.id, ...data, created_by: payload.created_by };
    },

    async update(id, data) {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updated_date: serverTimestamp(),
      });
      return { id, ...data };
    },

    async filter(criteria) {
      const entries = Object.entries(criteria);
      if (entries.length === 0) return this.list();
      const [field, value] = entries[0];
      const snap = await getDocs(query(col(), where(field, '==', value)));
      return snap.docs.map((d) => docToEntity(d.id, d.data()));
    },
  };
}

export function buildEntitiesApi() {
  const entities = {};
  for (const name of Object.keys(COLLECTIONS)) {
    entities[name] = createEntityApi(name);
  }

  entities.User = {
    async list() {
      const profiles = await entities.UserProfile.list('-updated_date', 200);
      return profiles.map((p) => ({
        id: p.id,
        email: p.created_by,
        full_name: p.organization_name || p.created_by,
      }));
    },
  };

  return entities;
}
