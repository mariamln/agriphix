export function getTraceUrl(batchId) {
  const id = encodeURIComponent(batchId);
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/trace?batch=${id}`;
  }
  return `/trace?batch=${id}`;
}

export function generateBatchId(cropType = '') {
  const prefix = cropType
    ? cropType.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'AG'
    : 'AG';
  return `BATCH-${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function generateDisplayHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
