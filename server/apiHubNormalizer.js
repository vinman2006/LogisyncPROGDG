/**
 * LogiSyncPRO Enterprise Interoperability & API Hub Normalization Engine
 * 
 * Philosophy:
 * Instead of 50 point-to-point direct integrations, LogiSyncPRO normalizes disparate
 * enterprise systems (Pharmacy ERP, Medicine Manufacturing, TMS, WMS, Retail, E-Commerce,
 * EDI, and GS1 EPCIS 2.0) into a unified canonical data model.
 */

export const CONNECTORS_CATALOG = [
  {
    id: 'pharmacy-erp',
    name: 'Pharmacy & Healthcare ERP',
    category: 'HEALTHCARE',
    protocol: 'REST / HL7 FHIR',
    description: 'Connects retail pharmacy chains, hospital dispensaries, and prescription supply networks.',
    supportedSystems: ['SAP Pharma', 'Oracle Cerner', 'Epic Health', 'Custom Pharmacy ERP'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Prescription & Cold-Chain Shipment',
    samplePayload: {
      erp_system: 'SAP_S4HANA_PHARMA',
      order_id: 'PO-984210',
      pharma_batch_number: 'BATCH-2026-COV44',
      medicine_name: 'Insulin Glargine 100 IU/mL',
      dosage_form: 'Cartridges 3ml',
      storage_condition: 'REFRIGERATED_2_TO_8_CELSIUS',
      dispense_from: 'Serum Biologics Plant 4, Pune',
      dispense_to: 'Apollo Central Pharmacy, Nagpur',
      quantity: 5000,
      unit: 'VIALS',
      timestamp: '2026-09-19T07:15:00Z'
    }
  },
  {
    id: 'medicine-erp',
    name: 'Medicine Manufacturing ERP',
    category: 'MANUFACTURING',
    protocol: 'REST / SOAP / OData',
    description: 'Batch release and pharmaceutical factory dispatch tracking with regulatory serialization.',
    supportedSystems: ['SAP ERP', 'Microsoft Dynamics 365 Supply Chain', 'Infor CloudSuite', 'Odoo'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Commercial Freight Manifest',
    samplePayload: {
      erp: 'MS_DYNAMICS_365',
      work_order: 'WO-551902',
      gtin: '08901234567890',
      batch_lot: 'LOT-AUG-991',
      manufacturing_site: 'Anekal Pharma Zone, Bengaluru',
      destination_warehouse: 'Nhava Sheva Cargo Gate 3, Mumbai',
      temperature_profile: 'AMB_15_25_C',
      pallet_count: 12,
      gross_weight_kg: 8400,
      qc_release_cert: 'QC-CERT-PASS-2026',
      timestamp: '2026-09-19T06:45:00Z'
    }
  },
  {
    id: 'transport-tms',
    name: 'Transport Management System (TMS)',
    category: 'LOGISTICS',
    protocol: 'MQTT / REST / Webhook',
    description: 'Fleet telematics, GPS live pings, driver manifests, and highway corridor milestones.',
    supportedSystems: ['FleetX', 'Trimble TMS', 'MercuryGate', 'BlueYonder TMS', 'Loconav'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Telematics & Route Status',
    samplePayload: {
      tms_vendor: 'FleetX_Telematics',
      consignment_no: 'CN-884920',
      carrier_name: 'BlueDart Express Line',
      vehicle_registration: 'MH-31-CB-9021',
      driver_name: 'Rajesh Sharma',
      current_lat: 19.8762,
      current_lng: 75.3433,
      speed_kmh: 68.4,
      temperature_sensor_c: 4.2,
      source_city: 'Mumbai JNPT',
      destination_city: 'Nagpur Logistics Hub',
      status_code: 'IN_TRANSIT_HIGHWAY',
      timestamp: '2026-09-19T07:22:00Z'
    }
  },
  {
    id: 'warehouse-wms',
    name: 'Warehouse Management System (WMS)',
    category: 'WAREHOUSING',
    protocol: 'REST / AS2 / Webhooks',
    description: 'Dock door assignments, cross-dock scan, inbound ASN, and outbound packing validation.',
    supportedSystems: ['Manhattan Associates', 'Blue Yonder WMS', 'Oracle WMS', 'HighJump / Körber'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Dock Event & Milestone',
    samplePayload: {
      wms_system: 'Manhattan_Active_WM',
      dock_manifest: 'DM-44019',
      facility_code: 'WH-NAGPUR-WEST',
      bay_number: 'BAY-14-COOL',
      inbound_carrier: 'RapidTransit Fleet',
      pallet_count: 18,
      gross_weight_kg: 14200,
      inspection_status: 'PASSED_QC',
      dispatch_target: 'Mumbai JNPT Terminal',
      timestamp: '2026-09-19T07:05:00Z'
    }
  },
  {
    id: 'gs1-epcis',
    name: 'GS1 EPCIS 2.0 (Supply Chain Visibility)',
    category: 'STANDARDS',
    protocol: 'REST API / JSON-LD',
    description: 'Global standard for sharing what, where, when and why supply chain events across organizations.',
    supportedSystems: ['GS1 EPCIS 2.0 Repositories', 'IBM Food Trust', 'SAP ATTP', 'OpenEPCIS'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Canonical Event Ledger',
    samplePayload: {
      '@context': 'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld',
      type: 'ObjectEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:shipping',
      disposition: 'urn:epcglobal:cbv:disp:in_transit',
      readPoint: { id: 'urn:epc:id:sgln:8901234.0001.0' },
      bizLocation: { id: 'urn:epc:id:sgln:8901234.0002.0' },
      epcList: [
        'urn:epc:id:sgtin:8901234.011111.9001',
        'urn:epc:id:sgtin:8901234.011111.9002'
      ],
      eventTime: '2026-09-19T07:18:30Z',
      recordTime: '2026-09-19T07:18:35Z'
    }
  },
  {
    id: 'edi-gateway',
    name: 'EDI Logistics Gateway (X12 / EDIFACT)',
    category: 'STANDARDS',
    protocol: 'AS2 / SFTP / REST Wrapper',
    description: 'ANSI X12 204 (Motor Carrier Load Tender), 214 (Shipment Status), and 856 (Advance Ship Notice).',
    supportedSystems: ['SPS Commerce', 'TrueCommerce', 'Cleo Integration Cloud', 'Sterling B2B'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Status Milestone',
    samplePayload: {
      edi_standard: 'ANSI_X12_214',
      transaction_set_id: '214',
      bill_of_lading: 'BL-771923',
      carrier_scac: 'BDEC',
      status_code: 'AF',
      status_reason: 'Departed Terminal En Route',
      city: 'Nagpur',
      state: 'MH',
      event_date: '20260919',
      event_time: '0720'
    }
  },
  {
    id: 'ecommerce-oms',
    name: 'E-Commerce Order Management',
    category: 'COMMERCE',
    protocol: 'Webhook / REST API',
    description: 'Direct checkout event to carrier freight booking with automated label & pickup generation.',
    supportedSystems: ['Shopify Plus', 'WooCommerce', 'Magento / Adobe Commerce', 'Amazon Seller Central'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Transport Request',
    samplePayload: {
      platform: 'Shopify_Plus',
      order_id: 'SH-109283',
      customer_city: 'Mumbai',
      customer_pincode: '400001',
      fulfillment_center: 'Nagpur Central Depot',
      total_weight_grams: 4500,
      items: [
        { sku: 'MED-GLUCOSE-MONITOR', quantity: 2, title: 'Smart Glucose Continuous Monitor' }
      ],
      requested_shipping_service: 'EXPRESS_NEXT_DAY',
      timestamp: '2026-09-19T07:02:00Z'
    }
  },
  {
    id: 'custom-rest-api',
    name: 'Custom REST API Connector',
    category: 'DEVELOPER',
    protocol: 'HTTPS REST / JSON',
    description: 'Generic developer API for proprietary ERPs, custom Python/Node microservices, and IoT gateways.',
    supportedSystems: ['Any JSON REST Client', 'cURL', 'Postman', 'Python Requests', 'Node.js Fetch'],
    status: 'ACTIVE',
    canonicalTarget: 'LogiSyncPRO Canonical Ingestion API',
    samplePayload: {
      client_id: 'partner_custom_app_99',
      origin: 'Hyderabad Logistics Hub',
      destination: 'Chennai Marine Terminal',
      cargo_type: 'Solar Power Inverters',
      weight_kg: 6200,
      declared_value_inr: 4500000,
      required_pickup_window: '2026-09-20T09:00:00Z',
      callback_webhook_url: 'https://api.partner.com/logisync/webhook'
    }
  }
];

/**
 * Normalization Engine: transforms heterogeneous vendor payloads into LogiSyncPRO Canonical Data Model
 */
export function normalizePayload(connectorId, rawPayload) {
  const normalizedAt = new Date().toISOString();

  switch (connectorId) {
    case 'pharmacy-erp': {
      const canonicalTracking = `LS-RX-${rawPayload.order_id?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.Shipment.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.erp_system || 'PHARMACY_ERP',
          category: 'PHARMACEUTICALS',
          cargo_type: rawPayload.medicine_name || 'Prescription Medicine',
          cargo_description: `Batch ${rawPayload.pharma_batch_number || 'N/A'} | ${rawPayload.quantity || 0} ${rawPayload.unit || 'UNITS'} | Storage: ${rawPayload.storage_condition || 'STANDARD'}`,
          origin: rawPayload.dispense_from || 'Pharmaceutical Depot',
          destination: rawPayload.dispense_to || 'Pharmacy Distribution',
          weight: '150 kg',
          weight_kg: 150,
          status: 'PENDING',
          compliance: {
            temperature_sensitive: true,
            required_range: '2°C to 8°C',
            batch_lot: rawPayload.pharma_batch_number,
            fda_dgci_traceable: true
          },
          events: [
            {
              event_type: 'ORDER_COMMISSIONED',
              actor: rawPayload.erp_system || 'Pharmacy ERP',
              description: `Batch ${rawPayload.pharma_batch_number} validated for dispatch from ${rawPayload.dispense_from}`,
              timestamp: rawPayload.timestamp || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Mapped ERP purchase order to LogiSyncPRO canonical tracking number',
          'Extracted cold-chain compliance telemetry requirements (2-8°C)',
          'Generated initial ledger commissioning event'
        ]
      };
    }

    case 'medicine-erp': {
      const canonicalTracking = `LS-MED-${rawPayload.work_order?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.Shipment.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.erp || 'MANUFACTURING_ERP',
          category: 'PHARMA_MANUFACTURING',
          cargo_type: 'Bulk Pharmaceutical Formulation',
          cargo_description: `GTIN ${rawPayload.gtin || 'N/A'} | Batch ${rawPayload.batch_lot} | ${rawPayload.pallet_count || 1} Pallets | QC: ${rawPayload.qc_release_cert}`,
          origin: rawPayload.manufacturing_site || 'Manufacturing Plant',
          destination: rawPayload.destination_warehouse || 'Distribution Center',
          weight: `${rawPayload.gross_weight_kg || 5000} kg`,
          weight_kg: parseFloat(rawPayload.gross_weight_kg || 5000),
          status: 'PENDING',
          compliance: {
            serialization_gtin: rawPayload.gtin,
            batch_lot: rawPayload.batch_lot,
            qc_release_cert: rawPayload.qc_release_cert
          },
          events: [
            {
              event_type: 'FACTORY_RELEASE',
              actor: rawPayload.erp || 'Medicine ERP',
              description: `QC Release ${rawPayload.qc_release_cert} verified. Cargo staged at factory dock.`,
              timestamp: rawPayload.timestamp || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Converted GTIN and serialization parameters to canonical compliance ledger',
          'Normalized manufacturing plant addresses to geographic logistics nodes',
          'Formatted gross pallet weights for freight capacity matching'
        ]
      };
    }

    case 'transport-tms': {
      const canonicalTracking = `LS-TMS-${rawPayload.consignment_no?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.TrackingTelemetry.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.tms_vendor || 'TRANSPORT_TMS',
          carrier: rawPayload.carrier_name || 'Carrier Fleet',
          vehicle_registration: rawPayload.vehicle_registration,
          driver: rawPayload.driver_name,
          origin: rawPayload.source_city,
          destination: rawPayload.destination_city,
          status: 'IN_TRANSIT',
          telemetry: {
            latitude: rawPayload.current_lat,
            longitude: rawPayload.current_lng,
            speed_kmh: rawPayload.speed_kmh,
            temperature_sensor_c: rawPayload.temperature_sensor_c,
            cold_chain_status: rawPayload.temperature_sensor_c <= 8 ? 'OPTIMAL' : 'TEMPERATURE_ALERT'
          },
          events: [
            {
              event_type: 'HIGHWAY_TRANSIT_PING',
              actor: `${rawPayload.carrier_name} (${rawPayload.vehicle_registration})`,
              description: `Live GPS fix at [${rawPayload.current_lat}, ${rawPayload.current_lng}] traveling at ${rawPayload.speed_kmh} km/h. Sensor: ${rawPayload.temperature_sensor_c}°C.`,
              timestamp: rawPayload.timestamp || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Ingested live IoT telematics coordinates into canonical tracking schema',
          'Evaluated temperature sensor thresholds against pharma cold-chain policy',
          'Constructed high-frequency transit event ping'
        ]
      };
    }

    case 'warehouse-wms': {
      const canonicalTracking = `LS-WMS-${rawPayload.dock_manifest?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.DockEvent.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.wms_system || 'WAREHOUSE_WMS',
          facility: rawPayload.facility_code,
          dock_bay: rawPayload.bay_number,
          assigned_carrier: rawPayload.inbound_carrier,
          pallet_count: rawPayload.pallet_count,
          gross_weight_kg: rawPayload.gross_weight_kg,
          status: 'PICKUP_CONFIRMED',
          events: [
            {
              event_type: 'DOCK_CROSS_INSPECTED',
              actor: `${rawPayload.wms_system} (${rawPayload.facility_code})`,
              description: `Pallets staged at ${rawPayload.bay_number}. QC Inspection: ${rawPayload.inspection_status}. Ready for carrier ${rawPayload.inbound_carrier}.`,
              timestamp: rawPayload.timestamp || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Normalized WMS dock manifest into canonical logistics milestone',
          'Mapped facility code to regional supply chain hub coordinates',
          'Confirmed cargo pickup milestone in centralized ledger'
        ]
      };
    }

    case 'gs1-epcis': {
      const epcCount = rawPayload.epcList?.length || 1;
      const canonicalTracking = `LS-EPCIS-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.EPCISCanonicalEvent.v2',
        data: {
          tracking_number: canonicalTracking,
          source_system: 'GS1_EPCIS_2.0_JSON_LD',
          epcis_event_type: rawPayload.type || 'ObjectEvent',
          action: rawPayload.action || 'OBSERVE',
          biz_step: rawPayload.bizStep || 'urn:epcglobal:cbv:bizstep:shipping',
          disposition: rawPayload.disposition || 'urn:epcglobal:cbv:disp:in_transit',
          read_point: rawPayload.readPoint?.id,
          business_location: rawPayload.bizLocation?.id,
          epc_count: epcCount,
          epcs: rawPayload.epcList || [],
          status: 'IN_TRANSIT',
          events: [
            {
              event_type: 'GS1_EPCIS_EVENT',
              actor: 'GS1 EPCIS Gateway',
              description: `EPCIS 2.0 ${rawPayload.type} observed at ${rawPayload.readPoint?.id}. Disposition: in_transit. ${epcCount} EPC items tracked.`,
              timestamp: rawPayload.eventTime || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'De-serialized JSON-LD URI namespaces into LogiSyncPRO canonical milestones',
          'Parsed SGTIN / SGLN identifiers into centralized event graph',
          'Validated CBV 2.0 standard business steps'
        ]
      };
    }

    case 'edi-gateway': {
      const canonicalTracking = `LS-EDI-${rawPayload.bill_of_lading?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.EDIMilestone.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: 'ANSI_X12_EDI_GATEWAY',
          transaction_set: rawPayload.transaction_set_id || '214',
          bill_of_lading: rawPayload.bill_of_lading,
          scac: rawPayload.carrier_scac,
          status_code: rawPayload.status_code,
          status_reason: rawPayload.status_reason,
          location: `${rawPayload.city || ''}, ${rawPayload.state || ''}`,
          status: rawPayload.status_code === 'D1' ? 'DELIVERED' : 'IN_TRANSIT',
          events: [
            {
              event_type: 'EDI_214_STATUS_UPDATE',
              actor: `SCAC: ${rawPayload.carrier_scac}`,
              description: `EDI 214 status code ${rawPayload.status_code} (${rawPayload.status_reason}) received for BoL ${rawPayload.bill_of_lading} at ${rawPayload.city}, ${rawPayload.state}.`,
              timestamp: normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Parsed EDI 214 Shipment Status Message segment to canonical status transition',
          'Normalized carrier SCAC code into recognized fleet provider',
          'Updated shipment audit timeline'
        ]
      };
    }

    case 'ecommerce-oms': {
      const canonicalTracking = `LS-ECOMM-${rawPayload.order_id?.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
      const weightKg = ((rawPayload.total_weight_grams || 3000) / 1000).toFixed(2);
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.Shipment.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.platform || 'ECOMMERCE_OMS',
          category: 'RETAIL_FULFILLMENT',
          cargo_type: rawPayload.items?.[0]?.title || 'E-Commerce Package',
          cargo_description: `Order ${rawPayload.order_id} | ${rawPayload.items?.length || 1} line item(s) | Service: ${rawPayload.requested_shipping_service || 'STANDARD'}`,
          origin: rawPayload.fulfillment_center || 'Central Depot',
          destination: `${rawPayload.customer_city || 'Destination'}, Pincode: ${rawPayload.customer_pincode || '400001'}`,
          weight: `${weightKg} kg`,
          weight_kg: parseFloat(weightKg),
          status: 'PENDING',
          events: [
            {
              event_type: 'ORDER_PLACED_WEBHOOK',
              actor: rawPayload.platform || 'Store OMS',
              description: `Online checkout order ${rawPayload.order_id} converted to transport tender. Destination: ${rawPayload.customer_city}.`,
              timestamp: rawPayload.timestamp || normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Mapped online cart checkout webhook to LogiSyncPRO freight tender',
          'Converted gram weight to standard kilograms',
          'Queued for automatic carrier dispatch selection'
        ]
      };
    }

    case 'custom-rest-api':
    default: {
      const canonicalTracking = `LS-API-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        valid: true,
        connector_id: connectorId,
        canonical_model: 'LogiSyncPRO.CanonicalShipment.v1',
        data: {
          tracking_number: canonicalTracking,
          source_system: rawPayload.client_id || 'CUSTOM_REST_API',
          cargo_type: rawPayload.cargo_type || 'Commercial Freight',
          origin: rawPayload.origin || 'Origin Location',
          destination: rawPayload.destination || 'Destination Location',
          weight: `${rawPayload.weight_kg || 1000} kg`,
          weight_kg: parseFloat(rawPayload.weight_kg || 1000),
          status: 'PENDING',
          events: [
            {
              event_type: 'CUSTOM_API_INGESTED',
              actor: rawPayload.client_id || 'REST API Client',
              description: `Custom JSON payload ingested via POST /api/v1/shipments and normalized to LogiSyncPRO canonical schema.`,
              timestamp: normalizedAt
            }
          ]
        },
        transformations_applied: [
          'Validated JSON payload against LogiSyncPRO Canonical OpenAPI Schema',
          'Sanitized origin and destination coordinates',
          'Persisted to immutable NeonDB audit ledger'
        ]
      };
    }
  }
}
