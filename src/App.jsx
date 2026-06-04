// ============================================================
// G&Q Properties - Room Application Form
// VERSION 2.1  —  Saved: 03 June 2026
// ============================================================
// What's new in v2.0 (since v1.0):
//  • Built-in applicant form (embedded in manager)
//  • Standalone application form (gq-application-form-v2.0)
//  • Real-time form → manager sync via localStorage
//  • Car park options: Outside (free) / Undercover (extra cost)
//  • Editable weekly rent + car park rent in application review
//  • Auto-calculated fortnightly rent & bond (room + car park)
//  • Rent realignment shows actual next fortnight start date
//  • Emergency contact: name, relationship & phone transferred
//  • "Add as Tenant" pre-fills all applicant details
//  • Due Day of Month removed (not applicable)
//  • Contract download removed (not applicable)
//  • Applications tab: Approve / Decline / Add as Tenant
//  • Contracts tab: archive, bond return tracking
//  • CSV bank statement import with auto-matching
//  • Company branding with logo upload
//  • 3-row navy header (G&Q navy/gold theme)
// ============================================================
import { useState, useCallback, memo, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// COMPANY LOCK — this form is exclusively for G&Q Properties
// Changing this identifier will break the link with the manager
const COMPANY_ID   = "gq-properties-au";
const COMPANY_NAME = "G&Q Properties";
const COMPANY_EMAIL = "Properties.gq@gmail.com";
const COMPANY_PHONE = "0405 159 267";
// ─────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────
// SHARED KEY — must match rental-manager.jsx exactly
const LS_KEY = "gq_applications_v1";

// Write to localStorage + fire a storage event so the manager
// receives it in real-time without any polling or rate limits.
function saveApplication(app) {
  const existing = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  const updated  = [app, ...existing];
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  // storageEvent lets other windows/iframes on same origin react instantly
  window.dispatchEvent(new StorageEvent("storage", {
    key: LS_KEY,
    newValue: JSON.stringify(updated),
    storageArea: localStorage,
  }));
}
// ─────────────────────────────────────────────────────────

const HOUSES = [
  { id:"h1", address:"2 Antrim Place, Beckenham 6107, WA" },
  { id:"h2", address:"10 Wannell St, Queens Park 6107, WA" },
  { id:"h3", address:"23 Silica Rd, Wattle Grove 6107, WA" },
];

const STEPS = ["Your Details","Co-Tenant","Room & Dates","Employment","Review & Submit"];

const inp = {
  width:"100%", border:"1.5px solid #e2e8f0", borderRadius:10,
  padding:"12px 14px", fontSize:16, fontFamily:"inherit",
  boxSizing:"border-box", background:"#fff", outline:"none",
  WebkitAppearance:"none", appearance:"none",
};

function FL({ label, req, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:800, color:"#1b2a4a", textTransform:"uppercase", letterSpacing:0.8, marginBottom:7 }}>
        {label}{req && <span style={{ color:"#dc2626" }}> *</span>}
      </div>
      {children}
    </div>
  );
}

function empty() {
  return {
    t1name:"", t1dob:"", t1phone:"", t1email:"", t1address:"",
    t1idType:"Driver Licence", t1idNumber:"",
    t1emergency:"", t1emergencyPhone:"", t1emergencyRelation:"",
    hasT2:false, t2name:"", t2phone:"", t2email:"",
    houseId:"", roomNum:"", carParkRequested:"outside", contractType:"fixed",
    startDate:"", endDate:"", pets:"None", smoker:"No",
    t1employer:"", t1jobTitle:"", t1income:"", t1employmentType:"full-time",
    prevAddress:"", prevLandlordPhone:"", references:"", notes:"",
    agreeTerms:false,
  };
}

// Each step is its own memo component — inputs never remount, keyboard stays up
const Step0 = memo(({ f, set }) => (
  <div>
    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#1b2a4a", marginBottom:18 }}>Your Details</div>
    <FL label="Full Legal Name" req><input style={inp} value={f.t1name} onChange={e=>set("t1name",e.target.value)} placeholder="As on your ID" autoComplete="name" /></FL>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
      <FL label="Date of Birth" req><input style={inp} type="date" value={f.t1dob} onChange={e=>set("t1dob",e.target.value)} /></FL>
      <FL label="Phone" req><input style={inp} type="tel" value={f.t1phone} onChange={e=>set("t1phone",e.target.value)} placeholder="04xx xxx xxx" autoComplete="tel" /></FL>
    </div>
    <FL label="Email" req><input style={inp} type="email" value={f.t1email} onChange={e=>set("t1email",e.target.value)} placeholder="your@email.com" autoComplete="email" /></FL>
    <FL label="Current Address" req><input style={inp} value={f.t1address} onChange={e=>set("t1address",e.target.value)} placeholder="Full address, suburb, state, postcode" autoComplete="street-address" /></FL>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
      <FL label="ID Type"><select style={inp} value={f.t1idType} onChange={e=>set("t1idType",e.target.value)}>
        <option>Driver Licence</option><option>Passport</option><option>Medicare Card</option><option>Student ID</option><option>Other</option>
      </select></FL>
      <FL label="ID Number"><input style={inp} value={f.t1idNumber} onChange={e=>set("t1idNumber",e.target.value)} /></FL>
    </div>
    <div style={{ background:"#f0f6ff", borderRadius:12, padding:"14px 16px" }}>
      <div style={{ fontSize:12, fontWeight:800, color:"#1b2a4a", textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 }}>Emergency Contact</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <FL label="Name"><input style={inp} value={f.t1emergency} onChange={e=>set("t1emergency",e.target.value)} /></FL>
        <FL label="Phone"><input style={inp} type="tel" value={f.t1emergencyPhone} onChange={e=>set("t1emergencyPhone",e.target.value)} /></FL>
        <FL label="Relationship"><input style={inp} value={f.t1emergencyRelation} onChange={e=>set("t1emergencyRelation",e.target.value)} /></FL>
      </div>
    </div>
  </div>
));

const Step1 = memo(({ f, set }) => (
  <div>
    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#1b2a4a", marginBottom:18 }}>Co-Tenant</div>
    <div style={{ display:"flex", gap:10, marginBottom:20 }}>
      {[["👤 Just me",false],["👥 Add co-tenant",true]].map(([lbl,val])=>(
        <button key={lbl} type="button" onClick={()=>set("hasT2",val)}
          style={{ flex:1, padding:14, borderRadius:12, border:`2px solid ${f.hasT2===val?"#1b2a4a":"#e2e8f0"}`, background:f.hasT2===val?"#1b2a4a":"#fff", color:f.hasT2===val?"#fff":"#64748b", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {lbl}
        </button>
      ))}
    </div>
    {f.hasT2 ? (<>
      <FL label="Co-Tenant Full Name" req><input style={inp} value={f.t2name} onChange={e=>set("t2name",e.target.value)} autoComplete="name" /></FL>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
        <FL label="Phone"><input style={inp} type="tel" value={f.t2phone} onChange={e=>set("t2phone",e.target.value)} /></FL>
        <FL label="Email"><input style={inp} type="email" value={f.t2email} onChange={e=>set("t2email",e.target.value)} /></FL>
      </div>
    </>) : (
      <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8" }}>
        <div style={{ fontSize:52 }}>👤</div>
        <div style={{ marginTop:10, fontSize:15 }}>Single occupancy — tap Continue.</div>
      </div>
    )}
  </div>
));

const Step2 = memo(({ f, set }) => (
  <div>
    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#1b2a4a", marginBottom:18 }}>Room & Dates</div>
    <FL label="House Address" req>
      <select style={inp} value={f.houseId} onChange={e=>set("houseId",e.target.value)}>
        <option value="">— Select house address —</option>
        {HOUSES.map(h=><option key={h.id} value={h.id}>{h.address}</option>)}
      </select>
    </FL>
    <FL label="Room Preference">
      <select style={inp} value={f.roomNum} onChange={e=>set("roomNum",e.target.value)}>
        <option value="">No preference — any available room</option>
        {[1,2,3,4,5,6].map(n=><option key={n} value={String(n)}>Room {n}</option>)}
      </select>
    </FL>
    <FL label="Car Park">
      <select style={inp} value={f.carParkRequested} onChange={e=>set("carParkRequested",e.target.value)}>
        <option value="outside">Outside Car Park (included — no extra cost)</option>
        <option value="undercover">Undercover Car Park (extra weekly cost applies)</option>
      </select>
    </FL>
    {f.carParkRequested === "undercover" && (
      <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:13, color:"#92400e" }}>
        🚗 Undercover car park requested. The weekly fee will be confirmed by G&Q Properties and added to your total rent.
      </div>
    )}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
      <FL label="Contract Type"><select style={inp} value={f.contractType} onChange={e=>set("contractType",e.target.value)}><option value="fixed">Fixed Term</option><option value="periodic">Periodic</option></select></FL>
      <div/>
      <FL label="Move-In Date" req><input style={inp} type="date" value={f.startDate} onChange={e=>set("startDate",e.target.value)} /></FL>
      {f.contractType==="fixed" && <FL label="End Date"><input style={inp} type="date" value={f.endDate} onChange={e=>set("endDate",e.target.value)} /></FL>}
      <FL label="Pets?"><select style={inp} value={f.pets} onChange={e=>set("pets",e.target.value)}><option>None</option><option>1 cat</option><option>1 dog</option><option>Multiple pets</option><option>Other</option></select></FL>
      <FL label="Smoker?"><select style={inp} value={f.smoker} onChange={e=>set("smoker",e.target.value)}><option>No</option><option>Yes (outdoors only)</option><option>Yes</option></select></FL>
    </div>
  </div>
));

const Step3 = memo(({ f, set }) => (
  <div>
    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#1b2a4a", marginBottom:18 }}>Employment & History</div>
    <FL label="Employer"><input style={inp} value={f.t1employer} onChange={e=>set("t1employer",e.target.value)} placeholder="Company, 'Self-employed' or 'Student'" /></FL>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
      <FL label="Job Title"><input style={inp} value={f.t1jobTitle} onChange={e=>set("t1jobTitle",e.target.value)} /></FL>
      <FL label="Employment Type">
        <select style={inp} value={f.t1employmentType} onChange={e=>set("t1employmentType",e.target.value)}>
          <option value="full-time">Full-time</option><option value="part-time">Part-time</option>
          <option value="casual">Casual</option><option value="self-employed">Self-employed</option><option value="student">Student</option>
        </select>
      </FL>
      <FL label="Weekly Income ($)"><input style={inp} type="number" value={f.t1income} onChange={e=>set("t1income",e.target.value)} /></FL>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
      <FL label="Previous Rental Address"><input style={inp} value={f.prevAddress} onChange={e=>set("prevAddress",e.target.value)} /></FL>
      <FL label="Previous Landlord Phone"><input style={inp} type="tel" value={f.prevLandlordPhone} onChange={e=>set("prevLandlordPhone",e.target.value)} /></FL>
    </div>
    <FL label="References & Notes">
      <textarea style={{...inp, minHeight:80, resize:"vertical"}} value={f.references} onChange={e=>set("references",e.target.value)} placeholder="Previous landlord, employer or character references..." />
    </FL>
  </div>
));

const Step4 = memo(({ f, set }) => {
  const house = HOUSES.find(h=>h.id===f.houseId);
  return (
    <div>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#1b2a4a", marginBottom:18 }}>Review & Submit</div>
      {[
        { title:"Applicant", rows:[["Name",f.t1name],["Phone",f.t1phone],["Email",f.t1email],["DOB",f.t1dob],["Address",f.t1address],["ID",`${f.t1idType} ${f.t1idNumber}`],["Emergency",`${f.t1emergency} (${f.t1emergencyRelation}) ${f.t1emergencyPhone}`]] },
        f.hasT2 && { title:"Co-Tenant", rows:[["Name",f.t2name],["Phone",f.t2phone],["Email",f.t2email]] },
        { title:"Room Request", rows:[["House",house?.address||"—"],["Room",f.roomNum?`Room ${f.roomNum}`:"No preference"],["Car Park",f.carParkRequested==="outside"?"Outside Car Park (no extra cost)":"Undercover Car Park (extra cost)"],["Move-In",f.startDate?new Date(f.startDate+"T00:00:00").toLocaleDateString("en-AU"):"TBD"],["Contract",f.contractType==="fixed"?"Fixed Term":"Periodic"],["Pets",f.pets],["Smoker",f.smoker]] },
        { title:"Employment", rows:[["Employer",f.t1employer],["Type",f.t1employmentType],["Income/wk",f.t1income?`$${f.t1income}`:""]] },
      ].filter(Boolean).map(s=>(
        <div key={s.title} style={{ background:"#f8faff", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#1b2a4a", textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>{s.title}</div>
          {s.rows.filter(([,v])=>v&&String(v).trim()&&v!=="  ").map(([l,v])=>(
            <div key={l} style={{ display:"flex", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:13, color:"#94a3b8", width:80, flexShrink:0 }}>{l}:</span>
              <span style={{ fontSize:13, color:"#1e293b", fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:12, padding:"14px 16px", marginBottom:14, fontSize:13, color:"#92400e" }}>
        📎 After submitting, please email your <strong>photo ID & latest payslip</strong> to <strong>Properties.gq@gmail.com</strong> — use your name as the subject.
      </div>
      <div style={{ background:"#f1f5f9", borderRadius:12, padding:"16px" }}>
        <label style={{ display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer" }}>
          <input type="checkbox" checked={f.agreeTerms} onChange={e=>set("agreeTerms",e.target.checked)}
            style={{ marginTop:3, width:22, height:22, cursor:"pointer", flexShrink:0, accentColor:"#1b2a4a" }} />
          <span style={{ fontSize:13, color:"#475569", lineHeight:1.7 }}>
            I confirm all information is accurate. I consent to G&Q Properties verifying my details, contacting my references, and storing my data to process this application.
          </span>
        </label>
      </div>
    </div>
  );
});

// ── Success screen ────────────────────────────────────────
function SuccessScreen({ name, email, ref, house }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1b2a4a,#2d4a6e)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Serif+Display&display=swap')`}</style>
      <div style={{ background:"#fff", borderRadius:24, padding:"48px 36px", maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ width:96, height:96, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:56 }}>✅</div>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:"#1b2a4a", marginBottom:10 }}>Application Submitted!</div>
        <p style={{ color:"#64748b", fontSize:15, lineHeight:1.7, marginBottom:24 }}>
          Thank you <strong style={{ color:"#1b2a4a" }}>{name}</strong>! Your application has been received and is now under review.
        </p>
        <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:16, padding:"20px", marginBottom:20, textAlign:"left", fontSize:14, lineHeight:2.2 }}>
          <div>📋 Reference: <strong style={{ fontFamily:"monospace", color:"#1b2a4a", fontSize:16 }}>{ref}</strong></div>
          <div>🏠 {house?.address || "Property to be confirmed"}</div>
        </div>
        <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:12, padding:"14px 18px", marginBottom:20, fontSize:13, color:"#166534", lineHeight:1.8 }}>
          We'll contact you at <strong>{email}</strong> within 2 business days.<br/>
          Please email your <strong>photo ID & payslip</strong> to <strong>Properties.gq@gmail.com</strong>
        </div>
        <p style={{ fontSize:12, color:"#94a3b8" }}>{COMPANY_NAME} · {COMPANY_PHONE} · {COMPANY_EMAIL}</p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function ApplicationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(empty());
  const [done, setDone] = useState(false);
  const [ref,  setRef]  = useState("");

  const set  = useCallback((k, v) => setForm(f => ({...f, [k]:v})), []);
  const next = useCallback(() => setStep(s => Math.min(s+1, STEPS.length-1)), []);
  const back = useCallback(() => setStep(s => Math.max(s-1, 0)), []);

  function submit() {
    if (!form.t1name || !form.agreeTerms) return;
    const refNum  = "GQ-" + Date.now().toString().slice(-6);
    const house   = HOUSES.find(h => h.id === form.houseId);
    const newApp  = {
      ...form,
      houseAddress: house?.address || "",
      id:           Date.now().toString(),
      ref:          refNum,
      submittedAt:  new Date().toLocaleDateString("en-AU"),
      submittedTime:new Date().toLocaleTimeString("en-AU"),
      status:       "pending",
      rentOffered:  "",
      source:       "online-form",
    };
    // Save to localStorage — shared with rental-manager on same origin
    saveApplication(newApp);
    setRef(refNum);
    setDone(true);
  }

  if (done) {
    const house = HOUSES.find(h => h.id === form.houseId);
    return <SuccessScreen name={form.t1name} email={form.t1email} ref={ref} house={house} />;
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1b2a4a,#2d4a6e)", fontFamily:"'DM Sans',sans-serif", padding:"20px 16px 48px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ maxWidth:620, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
          <div style={{ width:48,height:48,borderRadius:11,background:"#b8973a",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#1b2a4a",flexShrink:0 }}>G&Q</div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"#fff" }}>G&Q Properties</div>
            <div style={{ fontSize:10, color:"#b8973a", fontWeight:800, letterSpacing:1 }}>ROOM APPLICATION FORM</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display:"flex", gap:4, marginBottom:6 }}>
          {STEPS.map((_,i)=><div key={i} style={{ flex:1, height:5, borderRadius:4, background:i<=step?"#b8973a":"rgba(255,255,255,0.2)", transition:"background 0.3s" }} />)}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Step {step+1} of {STEPS.length}</span>
          <span style={{ fontSize:11, color:"#b8973a", fontWeight:800 }}>{STEPS[step].toUpperCase()}</span>
        </div>

        {/* Card */}
        <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px 24px", boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }}>
          {step === 0 && <Step0 f={form} set={set} />}
          {step === 1 && <Step1 f={form} set={set} />}
          {step === 2 && <Step2 f={form} set={set} />}
          {step === 3 && <Step3 f={form} set={set} />}
          {step === 4 && <Step4 f={form} set={set} />}

          {/* Nav */}
          <div style={{ display:"flex", gap:10, marginTop:24, paddingTop:18, borderTop:"1px solid #f1f5f9", alignItems:"center" }}>
            {step > 0 && (
              <button type="button" onClick={back}
                style={{ padding:"12px 22px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", fontWeight:700, fontSize:15, color:"#64748b", cursor:"pointer" }}>
                ← Back
              </button>
            )}
            <div style={{ flex:1 }} />
            {step < STEPS.length-1 ? (
              <button type="button" onClick={next}
                style={{ padding:"13px 32px", borderRadius:10, border:"none", background:"#1b2a4a", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer", boxShadow:"0 4px 14px rgba(27,42,74,0.3)" }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={!form.t1name || !form.agreeTerms}
                style={{ padding:"13px 32px", borderRadius:10, border:"none", background:form.t1name&&form.agreeTerms?"#059669":"#94a3b8", color:"#fff", fontWeight:800, fontSize:15, cursor:form.t1name&&form.agreeTerms?"pointer":"not-allowed" }}>
                ✓ Submit Application
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:18, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
          {COMPANY_NAME} · {COMPANY_PHONE} · {COMPANY_EMAIL}
        </div>
        <div style={{ textAlign:"center", marginTop:6, fontSize:10, color:"rgba(255,255,255,0.2)" }}>
          This form is exclusively for {COMPANY_NAME} applicants · Ref: {COMPANY_ID}
        </div>
      </div>
    </div>
  );
}
