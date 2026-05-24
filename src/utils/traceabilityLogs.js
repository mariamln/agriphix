import { api } from '@/api/client';

const STATUS_EVENTS = {
  pending: { event_type: 'created', description: 'Shipment batch registered' },
  in_transit: { event_type: 'picked_up', description: 'Shipment picked up and in transit' },
  delivered: { event_type: 'delivered', description: 'Shipment delivered to destination' },
  cancelled: { event_type: 'quality_check', description: 'Shipment cancelled' },
};

export async function createShipmentTraceLog(shipment, status) {
  if (!shipment?.batch_id) return;
  const mapping = STATUS_EVENTS[status];
  if (!mapping) return;

  try {
    await api.entities.TraceabilityLog.create({
      batch_id: shipment.batch_id,
      event_type: mapping.event_type,
      description: mapping.description,
      location: shipment.destination || shipment.origin_location,
      handler: shipment.transporter || shipment.farmer_name || shipment.buyer_name,
    });
  } catch (err) {
    console.warn('Could not create traceability log:', err);
  }
}
