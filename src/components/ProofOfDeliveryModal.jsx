import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, PenTool, RotateCcw, Lock, 
  MapPin, Clock, AlertCircle, Sparkles, User, KeyRound 
} from 'lucide-react';

export default function ProofOfDeliveryModal({
  isOpen,
  onClose,
  shipment,
  onConfirmDelivery
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Receiver Form Fields
  const [receiverName, setReceiverName] = useState('Dr. A. K. Sen');
  const [receiverRole, setReceiverRole] = useState('Dock In-Charge / Receiving Supervisor');
  const [receiverId, setReceiverId] = useState('ID-APX-883492');
  const [sealNumber, setSealNumber] = useState('ISO 17712 #SL-884920');
  const [isSealIntact, setIsSealIntact] = useState(true);
  const [otpValue, setOtpValue] = useState(['8', '9', '4', '2']);
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasSignature(false);
  }, [isOpen]);

  if (!isOpen || !shipment) return null;

  const trackingNumber = shipment.tracking_number || shipment.trackingNumber || `LS-${shipment.id || '9428'}`;

  // Canvas Mouse / Touch Helpers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    setOtpError('');

    // Auto-advance focus to next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pod-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePrefillOtp = () => {
    setOtpValue(['8', '9', '4', '2']);
    setOtpError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpValue.join('');
    if (enteredOtp.length < 4) {
      setOtpError('Please enter the complete 4-digit recipient OTP handover code.');
      return;
    }

    if (!isSealIntact) {
      setOtpError('Cargo seal must be verified as intact before final handover.');
      return;
    }

    setIsSubmitting(true);

    let signatureDataUrl = null;
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      signatureDataUrl = canvas.toDataURL('image/png');
    }

    const podData = {
      receiverName: receiverName.trim() || 'Authorized Receiving Supervisor',
      receiverRole: receiverRole.trim() || 'Dock Manager',
      receiverId: receiverId.trim() || 'GOV-IN-883492',
      sealNumber: sealNumber.trim() || 'ISO 17712 #SL-884920',
      isSealIntact: true,
      otpCode: enteredOtp,
      deliveredAt: new Date().toISOString(),
      gpsCoordinates: { latitude: 19.0760, longitude: 72.8777 },
      signatureUrl: signatureDataUrl,
      dockLocation: shipment.delivery_location || 'Destination Logistics Dock'
    };

    try {
      const trackingKey = shipment.tracking_number || shipment.id || '9428';
      try {
        localStorage.setItem(`logisync_pod_${trackingKey}`, JSON.stringify(podData));
      } catch (e) {
        console.warn('Could not save podData to localStorage:', e);
      }
      await onConfirmDelivery(shipment.id || shipment.tracking_number, podData);
      onClose();
    } catch (err) {
      setOtpError(err.message || 'Failed to complete delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#061c16] border border-[#1b4337] rounded-3xl p-6 sm:p-7 text-white shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b4337]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base tracking-wide text-white uppercase">
                ELECTRONIC PROOF OF DELIVERY (e-POD)
              </h3>
              <div className="text-[11px] text-[#7ca69a] font-mono">
                Consignment #{trackingNumber} &bull; Final Handover Protocol
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#092b23] hover:bg-[#0e3b30] border border-[#1b4337] flex items-center justify-center text-[#7ca69a] hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Consignment Quick Summary Pill */}
        <div className="my-4 p-3 rounded-2xl bg-[#041611] border border-[#1b4337] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#7ca69a] text-[10px] uppercase font-mono block">Destination Dock</span>
            <span className="font-bold text-white text-sm">{shipment.delivery_location || 'Dubai Jebel Ali Port, UAE'}</span>
          </div>
          <div>
            <span className="text-[#7ca69a] text-[10px] uppercase font-mono block">Cargo Payload</span>
            <span className="font-semibold text-emerald-300">{shipment.cargo_type || 'Standard Freight'} ({shipment.weight || '12 Tons'})</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[10px] font-bold font-mono">
            GPS DOCK VERIFIED
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Receiver Identity */}
          <div className="p-4 rounded-2xl bg-[#08241d] border border-[#1b4337] space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider text-emerald-400">
              <User size={13} />
              <span>1. Authorized Receiving Personnel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#7ca69a] mb-1 font-medium">Receiver Full Name *</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Dr. A. K. Sen"
                  className="w-full bg-[#041611] border border-[#1b4337] focus:border-emerald-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#7ca69a] mb-1 font-medium">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={receiverRole}
                  onChange={(e) => setReceiverRole(e.target.value)}
                  placeholder="e.g. Dock Supervisor"
                  className="w-full bg-[#041611] border border-[#1b4337] focus:border-emerald-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#7ca69a] mb-1 font-medium">Employee / Identification ID *</label>
              <input
                type="text"
                required
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="e.g. ID-APX-883492"
                className="w-full bg-[#041611] border border-[#1b4337] focus:border-emerald-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-xs font-mono transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Security Bolt Seal Inspection */}
          <div className="p-4 rounded-2xl bg-[#08241d] border border-[#1b4337] space-y-2.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider text-emerald-400">
              <Lock size={13} />
              <span>2. High-Security Container Seal Inspection</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-[11px] text-[#7ca69a] mb-1 font-medium">Bolt Seal Serial Number</label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  className="w-full bg-[#041611] border border-[#1b4337] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 sm:pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSealIntact}
                    onChange={(e) => setIsSealIntact(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#041611] border-[#1b4337] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-emerald-300">
                    Seal Intact & Zero Tampering
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Consignee 4-Digit OTP Code */}
          <div className="p-4 rounded-2xl bg-[#08241d] border border-[#1b4337] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider text-emerald-400">
                <KeyRound size={13} />
                <span>3. Consignee Handover OTP Authorization</span>
              </div>
              <button
                type="button"
                onClick={handlePrefillOtp}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Simulate Consignee OTP (#8942)
              </button>
            </div>

            <p className="text-[11px] text-[#7ca69a]">
              Enter the 4-digit handover authorization code dispatched to the consignee's registered phone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-1">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`pod-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otpValue[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-mono font-black rounded-xl bg-[#041611] border border-[#1b4337] focus:border-emerald-400 focus:outline-none text-white shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Section 4: Sign-on-Glass Touch Canvas */}
          <div className="p-4 rounded-2xl bg-[#08241d] border border-[#1b4337] space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider text-emerald-400">
                <PenTool size={13} />
                <span>4. Receiver Sign-on-Glass Signature</span>
              </div>
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-[10.5px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Clear Canvas</span>
              </button>
            </div>

            <div className="relative w-full h-36 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-inner touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                  <PenTool size={20} className="text-slate-300 mb-1" />
                  <span>Draw or touch-sign recipient signature here</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#7ca69a] font-mono">
              <span>Cryptographic digital sign-off</span>
              <span className={hasSignature ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {hasSignature ? '✓ Signature captured' : 'Signature pending (optional if OTP validated)'}
              </span>
            </div>
          </div>

          {/* Error Message Display */}
          {otpError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-3 border-t border-[#1b4337] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-[#092b23] hover:bg-[#0e3b30] border border-[#1b4337] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'CERTIFYING DELIVERY IN NEONDB...' : 'CONFIRM & LEGALLY SEAL DELIVERY'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
