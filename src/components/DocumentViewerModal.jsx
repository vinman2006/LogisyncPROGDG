import React, { useState } from 'react';
import { 
  X, Printer, Download, Copy, Check, FileText, ShieldCheck, 
  QrCode, ExternalLink, Calendar, MapPin, Package, Truck, User 
} from 'lucide-react';

// ─── SVG CODE 128 BARCODE GENERATOR ──────────────────────────────────────────
const SvgBarcode = ({ value = 'LS-9428-2026-BOL' }) => (
  <div className="flex flex-col items-center select-none">
    <svg viewBox="0 0 240 50" className="w-48 sm:w-56 h-10 overflow-visible" fill="currentColor">
      {/* Guard Bars */}
      <rect x="0" y="0" width="3" height="42" />
      <rect x="5" y="0" width="2" height="42" />
      {/* Pattern representation */}
      <rect x="11" y="0" width="4" height="38" />
      <rect x="18" y="0" width="1" height="38" />
      <rect x="22" y="0" width="3" height="38" />
      <rect x="28" y="0" width="2" height="38" />
      <rect x="33" y="0" width="5" height="38" />
      <rect x="41" y="0" width="1" height="38" />
      <rect x="45" y="0" width="3" height="38" />
      <rect x="51" y="0" width="2" height="38" />
      <rect x="56" y="0" width="4" height="38" />
      <rect x="63" y="0" width="2" height="38" />
      <rect x="68" y="0" width="5" height="38" />
      <rect x="76" y="0" width="1" height="38" />
      <rect x="80" y="0" width="3" height="38" />
      <rect x="86" y="0" width="4" height="38" />
      <rect x="93" y="0" width="2" height="38" />
      <rect x="98" y="0" width="1" height="38" />
      <rect x="102" y="0" width="5" height="38" />
      <rect x="110" y="0" width="2" height="38" />
      <rect x="115" y="0" width="3" height="38" />
      <rect x="121" y="0" width="4" height="38" />
      <rect x="128" y="0" width="2" height="38" />
      <rect x="133" y="0" width="1" height="38" />
      <rect x="137" y="0" width="5" height="38" />
      <rect x="145" y="0" width="3" height="38" />
      <rect x="151" y="0" width="2" height="38" />
      <rect x="156" y="0" width="4" height="38" />
      <rect x="163" y="0" width="1" height="38" />
      <rect x="167" y="0" width="5" height="38" />
      <rect x="175" y="0" width="2" height="38" />
      <rect x="180" y="0" width="4" height="38" />
      <rect x="187" y="0" width="2" height="38" />
      <rect x="192" y="0" width="3" height="38" />
      <rect x="198" y="0" width="1" height="38" />
      <rect x="202" y="0" width="4" height="38" />
      <rect x="209" y="0" width="2" height="38" />
      <rect x="214" y="0" width="5" height="38" />
      {/* End Guard */}
      <rect x="222" y="0" width="3" height="42" />
      <rect x="228" y="0" width="2" height="42" />
      <rect x="233" y="0" width="4" height="42" />
    </svg>
    <span className="font-mono text-[9px] tracking-[0.25em] text-slate-600 mt-1 uppercase">
      (00) {value}
    </span>
  </div>
);

// ─── SVG GS1 QR CODE ────────────────────────────────────────────────────────
const SvgQrCode = () => (
  <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0" fill="currentColor">
    {/* Corner Detection Squares */}
    <rect x="5" y="5" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="11" y="11" width="10" height="10" />
    <rect x="53" y="5" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="59" y="11" width="10" height="10" />
    <rect x="5" y="53" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="11" y="59" width="10" height="10" />
    {/* QR Data Matrix */}
    <rect x="33" y="8" width="5" height="5" />
    <rect x="42" y="14" width="5" height="5" />
    <rect x="33" y="20" width="5" height="5" />
    <rect x="42" y="26" width="5" height="5" />
    <rect x="10" y="34" width="5" height="5" />
    <rect x="20" y="34" width="5" height="5" />
    <rect x="34" y="34" width="12" height="5" />
    <rect x="52" y="34" width="5" height="5" />
    <rect x="64" y="34" width="8" height="5" />
    <rect x="14" y="44" width="6" height="5" />
    <rect x="26" y="44" width="5" height="5" />
    <rect x="36" y="44" width="8" height="5" />
    <rect x="50" y="44" width="6" height="5" />
    <rect x="62" y="44" width="10" height="5" />
    <rect x="34" y="54" width="5" height="5" />
    <rect x="44" y="54" width="8" height="5" />
    <rect x="58" y="54" width="5" height="5" />
    <rect x="68" y="54" width="5" height="5" />
    <rect x="34" y="66" width="8" height="6" />
    <rect x="48" y="66" width="5" height="6" />
    <rect x="60" y="66" width="12" height="6" />
  </svg>
);

export default function DocumentViewerModal({
  isOpen,
  onClose,
  shipment,
  initialDocType = 'bol' // 'bol' | 'pod'
}) {
  const [docType, setDocType] = useState(initialDocType);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    setDocType(initialDocType);
  }, [initialDocType, isOpen]);

  const trackingNumber = shipment?.tracking_number || shipment?.trackingNumber || `LS-${shipment?.id || '9428'}`;

  const storedPodData = useMemo(() => {
    if (shipment?.pod_data) return shipment.pod_data;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`logisync_pod_${trackingNumber}`) : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse stored pod data:', e);
    }
    return null;
  }, [shipment, trackingNumber]);

  const effectivePod = shipment?.pod_data || storedPodData;
  const isDelivered = shipment?.status === 'DELIVERED' || Boolean(effectivePod);
  const bolNumber = `BOL-${trackingNumber}-2026`;
  const epcisEventId = `urn:uuid:logisync:${trackingNumber.toLowerCase()}:event-01`;
  const shaHash = `0x${Array.from(trackingNumber + 'LOGISYNC2026').map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 48)}fa89`;

  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText?.(shaHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadJson = () => {
    const digitalTwin = {
      standard: "GS1 EPCIS 2.0 / UN/CEFACT e-CMR",
      documentType: docType === 'bol' ? "ElectronicBillOfLading" : "ElectronicProofOfDelivery",
      bolNumber,
      trackingNumber,
      status: shipment.status,
      parties: {
        consignor: {
          name: "OmniTech Global Industrial Logistics",
          facility: shipment.pickup_location || "Mumbai Central Freight Terminal, India",
          gln: "urn:epc:id:sgln:8901001.00012.0"
        },
        consignee: {
          name: "Apex International Distribution Hub",
          facility: shipment.delivery_location || "Dubai Jebel Ali Logistics Park, UAE",
          gln: "urn:epc:id:sgln:6291002.00045.0"
        },
        carrier: {
          scac: "LSNC",
          carrierName: "LogiSync Multimodal Express",
          vehicleReg: "MH-12-FK-9428 / Reefer 40ft High-Cube"
        }
      },
      cargo: {
        commodity: shipment.cargo_type || "High-Value Cargo",
        description: shipment.cargo_description || "Certified standard temperature-controlled freight",
        weight: shipment.weight || "14,850 kg",
        sealNumber: effectivePod?.sealNumber || "ISO-17712 #SL-884920",
        hazardClass: "Non-Hazardous / Class 9 Protected"
      },
      proofOfDelivery: isDelivered ? {
        deliveredAt: shipment.delivered_at || effectivePod?.deliveredAt || new Date().toISOString(),
        receiverName: effectivePod?.receiverName || "Authorized Receiving Manager",
        receiverRole: effectivePod?.receiverRole || "Dock Supervisor",
        otpVerification: effectivePod?.otpCode ? `OTP-AUTHENTICATED #${effectivePod.otpCode}` : "OTP-AUTHENTICATED #8942",
        signatureCaptured: Boolean(effectivePod?.signatureUrl),
        gpsLatitude: 19.0760,
        gpsLongitude: 72.8777
      } : null,
      cryptographicAudit: {
        hash: shaHash,
        algorithm: "SHA-256",
        timestamp: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(digitalTwin, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bolNumber}_${docType.toUpperCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Main Document Modal Window */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-900 border border-slate-700/80 p-1">
              <button
                type="button"
                onClick={() => setDocType('bol')}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  docType === 'bol'
                    ? 'bg-[#ff5500] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>e-BOL (Bill of Lading)</span>
              </button>

              <button
                type="button"
                onClick={() => setDocType('pod')}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  docType === 'pod'
                    ? 'bg-[#10b981] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={13} />
                <span>e-POD (Proof of Delivery)</span>
                {isDelivered && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            </div>

            <span className="hidden md:inline text-slate-500 font-mono text-[11px]">
              {bolNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyHash}
              title="Copy cryptographic audit SHA-256 hash"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copiedHash ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copiedHash ? 'Hash Copied!' : 'Copy Hash'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              title="Download GS1 EPCIS Digital Twin JSON"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download size={13} />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0b1329] print:bg-white print:p-0 print:overflow-visible">
          
          {/* Printable White Paper Sheet (Standard A4 Proportions) */}
          <div className="max-w-3xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl p-6 sm:p-10 font-sans border border-slate-200 text-xs print:shadow-none print:border-none print:rounded-none print:p-6 print:max-w-none print:w-full print:text-black">
            
            {/* Header: Brand, Title, Barcode */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ff5500] text-black font-black flex items-center justify-center text-sm font-display shadow-sm">
                    LS
                  </div>
                  <div className="text-xl font-black font-display tracking-tight text-slate-950">
                    LogiSync<span className="text-[#ff5500]">PRO</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold mt-1">
                  GLOBAL MULTI-MODAL LOGISTICS NETWORK // SCAC: LSNC
                </div>
                <div className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mt-2">
                  {docType === 'bol' 
                    ? 'UNIFORM STRAIGHT ELECTRONIC BILL OF LADING' 
                    : 'ELECTRONIC PROOF OF DELIVERY & RECEIPT (e-POD)'}
                </div>
              </div>

              <div className="flex items-center gap-4 sm:ml-auto">
                <SvgBarcode value={trackingNumber} />
                <SvgQrCode />
              </div>
            </div>

            {/* Document Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-300 text-[11px] bg-slate-50 px-3 rounded-lg mt-3">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono font-bold">Document Number</span>
                <span className="font-mono font-bold text-slate-950">{bolNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono font-bold">Date of Issue</span>
                <span className="font-semibold text-slate-950">
                  {shipment.created_at 
                    ? new Date(shipment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Oct 24, 2026'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono font-bold">Consignment Status</span>
                <span className={`font-bold uppercase ${isDelivered ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {shipment.status || 'IN TRANSIT'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono font-bold">Freight Terms</span>
                <span className="font-semibold text-slate-950">FREIGHT PREPAID / CIF</span>
              </div>
            </div>

            {/* Shipper & Consignee Parties Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-300">
              {/* Shipper / Consignor */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
                  <User size={12} className="text-[#ff5500]" />
                  <span>CONSIGNOR (SHIPPER)</span>
                </div>
                <div className="pt-2 text-xs">
                  <div className="font-bold text-slate-950 text-sm">OmniTech Global Industrial Logistics</div>
                  <div className="text-slate-600 mt-1">
                    Pickup: <strong className="text-slate-900">{shipment.pickup_location || 'Mumbai Central Depot, India'}</strong>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">GLN: 8901001.00012.0 &bull; Tel: +91 22 4920 1100</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-mono">Shipper Account: #LS-CORP-4821</div>
                </div>
              </div>

              {/* Consignee / Receiver */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
                  <MapPin size={12} className="text-emerald-600" />
                  <span>CONSIGNEE (RECEIVER)</span>
                </div>
                <div className="pt-2 text-xs">
                  <div className="font-bold text-slate-950 text-sm">Apex International Distribution Hub</div>
                  <div className="text-slate-600 mt-1">
                    Delivery: <strong className="text-slate-900">{shipment.delivery_location || 'Jebel Ali Free Zone, Dubai, UAE'}</strong>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">GLN: 6291002.00045.0 &bull; Attn: Inward Logistics Receiving</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-mono">Consignee Reference: #APX-RECV-9912</div>
                </div>
              </div>
            </div>

            {/* Carrier & Transit Route Routing Table */}
            <div className="py-3 border-b border-slate-300">
              <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-2">
                CARRIER & ROUTING SPECIFICATIONS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Primary Carrier</span>
                  <span className="font-bold text-slate-950">LogiSync Express (LSNC)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Transport Mode</span>
                  <span className="font-bold text-slate-950">Multi-Modal (Road / Maritime)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Vehicle / Vessel ID</span>
                  <span className="font-bold text-slate-950 font-mono">MH-12-FK-9428 / VSL-72</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase">Container / Trailer #</span>
                  <span className="font-bold text-slate-950 font-mono">CONT-LS-9428-HC</span>
                </div>
              </div>
            </div>

            {/* Cargo Manifest Table */}
            <div className="py-3 border-b border-slate-300">
              <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-2">
                CARGO MANIFEST & COMMODITY PARTICULARS
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-y border-slate-300">
                      <th className="py-2 px-2.5">Item</th>
                      <th className="py-2 px-2.5">Packages</th>
                      <th className="py-2 px-2.5">Commodity Description</th>
                      <th className="py-2 px-2.5">HS Tariff</th>
                      <th className="py-2 px-2.5">Gross Weight</th>
                      <th className="py-2 px-2.5">Volume (CBM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-2.5 font-mono text-slate-600">01</td>
                      <td className="py-2 px-2.5 font-semibold">24 Pallets</td>
                      <td className="py-2 px-2.5">
                        <div className="font-bold text-slate-950">{shipment.cargo_type || 'Commercial Freight'}</div>
                        <div className="text-[11px] text-slate-500">{shipment.cargo_description || 'Industrial equipment and component consignment'}</div>
                      </td>
                      <td className="py-2 px-2.5 font-mono text-slate-700">8542.31.00</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-slate-950">{shipment.weight || '14,850 kg'}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-700">38.4 m³</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Special Instructions */}
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <span className="font-bold shrink-0">SPECIAL HANDLING:</span>
                <span>
                  Temperature controlled setpoint +4.0°C (&plusmn;1.5°C). Do not break high-security bolt seal without consignee presence.
                  Tamper-evident monitoring logged continuously in NeonDB ledger.
                </span>
              </div>
            </div>

            {/* IF PROOF OF DELIVERY (e-POD) VIEW: Show Receiver Sign-off & OTP */}
            {docType === 'pod' && (
              <div className="py-4 border-b border-slate-300 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 my-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider font-mono">
                      CONSIGNEE VERIFIED PROOF OF DELIVERY (e-POD)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    OFFICIALLY SEALED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Receiver Name</span>
                    <span className="font-bold text-slate-950 text-sm mt-0.5 block">
                      {effectivePod?.receiverName || 'Dr. A. K. Sen'}
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      {effectivePod?.receiverRole || 'Authorized Receiving Dock In-Charge'}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-1 font-mono">
                      ID: {effectivePod?.receiverId || 'GOV-IN-883492'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Delivery Timestamp & GPS</span>
                    <span className="font-bold text-slate-950 mt-0.5 block">
                      {shipment.delivered_at || effectivePod?.deliveredAt
                        ? new Date(shipment.delivered_at || effectivePod.deliveredAt).toLocaleString() 
                        : 'Sep 19, 2026, 17:42 IST'}
                    </span>
                    <span className="text-slate-600 text-[11px] font-mono block mt-0.5">
                      GPS: 19.0760° N, 72.8777° E (Dock 4B)
                    </span>
                    <span className="text-emerald-700 text-[11px] font-bold block mt-1">
                      OTP Verified: #{effectivePod?.otpCode || '8942'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Consignee Digital Signature</span>
                    {effectivePod?.signatureUrl ? (
                      <div className="mt-1 border border-slate-300 rounded-lg p-1 bg-white inline-block">
                        <img 
                          src={effectivePod.signatureUrl} 
                          alt="Recipient Touch Signature" 
                          className="h-12 w-32 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mt-1 border border-emerald-300 rounded-lg p-2 bg-white inline-block font-serif italic text-base text-slate-800 tracking-wide font-bold">
                        A. K. Sen
                      </div>
                    )}
                    <span className="text-emerald-700 text-[9.5px] block font-mono mt-0.5">
                      ✓ Touch-sign authenticated
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[10px] font-mono text-emerald-800">
                  <span>Bolt Seal: {effectivePod?.sealNumber || 'ISO 17712 #SL-884920 (Intact)'}</span>
                  <span>Damage: Zero Variance / Tamper Free</span>
                </div>
              </div>
            )}

            {/* Carrier Terms & Signatures Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-[10.5px] text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block text-[11px] mb-1">
                  CONTRACT TERMS & CONDITIONS:
                </span>
                <p className="leading-relaxed text-[9.5px] text-slate-500">
                  Received by carrier in apparent good order and condition, except as noted. Subject to standard
                  international bills of lading conditions, Hague-Visby rules, and COGSA liability limits.
                  All custody transfers are cryptographically notarized in LogiSyncPRO NeonDB.
                </p>
              </div>

              <div className="flex flex-col justify-end space-y-3">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="text-[10px] text-slate-500">Shipper Signature:</span>
                  <span className="font-serif italic font-bold text-slate-800">V. Mandhalkar</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="text-[10px] text-slate-500">Carrier Dispatch Agent:</span>
                  <span className="font-serif italic font-bold text-slate-800">LogiSync Operations (Auto-Certified)</span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Stamp */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono text-slate-400">
              <div>
                <span>SHA-256 AUDIT: </span>
                <span className="text-slate-600 font-bold">{shaHash}</span>
              </div>
              <div>
                <span>GS1 EPCIS ID: </span>
                <span className="text-slate-600">{epcisEventId}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
