import React, { useState } from "react";
import { Truck, Package, ArrowRight, Loader2, AlertCircle, Zap } from "lucide-react";

const DEMO_SHIPPER = {
  uid: "demo-shipper-logisync-001",
  email: "shipper@demo.logisync.app",
  name: "Demo Shipper",
  role: "REQUESTER",
  city: "Nagpur",
  state: "Maharashtra",
  country: "India",
};

const DEMO_OPERATOR = {
  uid: "demo-operator-logisync-001",
  email: "operator@demo.logisync.app",
  name: "Demo Operator",
  role: "TRANSPORT_PROVIDER",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
};

async function createDemoUser(demoData) {
  const res = await fetch("/api/user/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-firebase-uid": demoData.uid },
    body: JSON.stringify({ firebase_uid: demoData.uid, email: demoData.email, name: demoData.name, role: demoData.role, city: demoData.city, state: demoData.state, country: demoData.country }),
  });
  if (!res.ok) throw new Error("Failed to create demo user: " + res.status);
  const data = await res.json();
  return data.user;
}

export default function DemoRoleLogin({ onSelectRole, onSignInWithGoogle }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = async (roleKey) => {
    setLoading(roleKey);
    setError(null);
    const demoData = roleKey === "shipper" ? DEMO_SHIPPER : DEMO_OPERATOR;
    try {
      const savedProfile = await createDemoUser(demoData);
      const session = { uid: demoData.uid, email: demoData.email, name: demoData.name, role: demoData.role, neonProfile: savedProfile, createdAt: Date.now() };
      localStorage.setItem("logisync_demo_session", JSON.stringify(session));
      onSelectRole(session);
    } catch (err) {
      setError("Could not connect to the server. Make sure the dev server is running on port 5173.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0d1a",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"#0e3328",border:"1px solid #1b5c47",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg viewBox="0 0 24 24" style={{width:"18px",height:"18px",color:"#ff5500",fill:"currentColor"}}><path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.311L19.41 8.5 12 12.689 4.59 8.5 12 4.311zM4 9.934l7 3.955v7.234l-7-3.955V9.934zm9 11.189v-7.234l7-3.955v7.234l-7 3.955z"/></svg>
            </div>
            <span style={{fontSize:"1.5rem",fontWeight:"700",color:"white",letterSpacing:"-0.02em"}}>LogiSync<span style={{color:"#ff5500"}}>PRO</span></span>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(255,85,0,0.1)",border:"1px solid rgba(255,85,0,0.2)",borderRadius:"999px",padding:"4px 12px",marginBottom:"1rem"}}>
            <span style={{fontSize:"11px",color:"#ff5500",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase"}}>? Quick Demo Access</span>
          </div>
          <p style={{color:"#6b7a99",fontSize:"0.875rem",lineHeight:"1.6"}}>Select your role to enter the live platform.<br/>Both sessions use real NeonDB data.</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"1rem",marginBottom:"1.5rem"}}>
          <button id="demo-shipper-btn" onClick={() => handleSelect("shipper")} disabled={loading !== null}
            style={{width:"100%",background:"#0d1117",border:"1px solid #1e2d40",borderRadius:"16px",padding:"1.25rem",textAlign:"left",cursor:"pointer",transition:"all 0.2s",opacity:loading ? 0.6 : 1}}>
            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#0a1f15",border:"1px solid rgba(16,185,129,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {loading === "shipper" ? <span style={{color:"#10b981",fontSize:"18px"}}>?</span> : <span style={{fontSize:"20px"}}>??</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{color:"white",fontWeight:"600",fontSize:"1rem",marginBottom:"2px"}}>Shipper</div>
                <div style={{color:"#6b7a99",fontSize:"0.8rem"}}>Create consignments · Track status · View acceptances</div>
              </div>
              <span style={{color:"#10b981",fontSize:"18px"}}>?</span>
            </div>
            <div style={{marginTop:"0.75rem",display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#10b981"}}/>
              <span style={{fontSize:"11px",color:"rgba(16,185,129,0.7)"}}>Live · Real NeonDB session</span>
            </div>
          </button>

          <button id="demo-operator-btn" onClick={() => handleSelect("operator")} disabled={loading !== null}
            style={{width:"100%",background:"#0d1117",border:"1px solid #1e2d40",borderRadius:"16px",padding:"1.25rem",textAlign:"left",cursor:"pointer",transition:"all 0.2s",opacity:loading ? 0.6 : 1}}>
            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#0e0e1f",border:"1px solid rgba(99,102,241,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {loading === "operator" ? <span style={{color:"#6366f1",fontSize:"18px"}}>?</span> : <span style={{fontSize:"20px"}}>??</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{color:"white",fontWeight:"600",fontSize:"1rem",marginBottom:"2px"}}>Logistics Operator</div>
                <div style={{color:"#6b7a99",fontSize:"0.8rem"}}>Browse consignments · Accept jobs · Manage deliveries</div>
              </div>
              <span style={{color:"#6366f1",fontSize:"18px"}}>?</span>
            </div>
            <div style={{marginTop:"0.75rem",display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#6366f1"}}/>
              <span style={{fontSize:"11px",color:"rgba(99,102,241,0.7)"}}>Live · Real NeonDB session</span>
            </div>
          </button>
        </div>

        {error && (
          <div style={{marginBottom:"1.25rem",display:"flex",alignItems:"flex-start",gap:"8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"12px",padding:"12px 16px"}}>
            <span style={{color:"#f87171",fontSize:"13px"}}>? {error}</span>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.25rem"}}>
          <div style={{flex:1,height:"1px",background:"#1e2d40"}}/>
          <span style={{color:"#6b7a99",fontSize:"12px"}}>or</span>
          <div style={{flex:1,height:"1px",background:"#1e2d40"}}/>
        </div>

        <button id="google-signin-btn" onClick={onSignInWithGoogle} disabled={loading !== null}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"12px",color:"white",fontSize:"14px",fontWeight:"500",cursor:"pointer",transition:"all 0.2s",opacity:loading ? 0.5 : 1}}>
          <svg style={{width:"16px",height:"16px"}} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <p style={{textAlign:"center",color:"#6b7a99",fontSize:"11px",marginTop:"1.25rem"}}>Demo sessions persist across refreshes. Data stored in real NeonDB.</p>
      </div>
    </div>
  );
}
