// Version history for the G&Q Room Application Form (gq-apply).
// Add every new change to the TOP of this list – the newest version is shown in the header.
import { useState } from "react";

export const CHANGELOG = [
  {
    version: "3.3",
    date: "2026-10-10",
    changes: ["Version number shown at the top of the form; tap it to see this version history."],
  },
  {
    version: "3.2",
    date: "2026-10-10",
    changes: [
      "Applicants upload their documents (photo ID, proof of income…) in the form itself – new 'Documents' step.",
      "Files go to the private storage area 'application-docs'; only G&Q staff can open them.",
    ],
  },
  {
    version: "3.1",
    date: "2026-10-09",
    changes: [
      "Applications are saved as new entries only, so the form keeps working with the database security (lock) switched on.",
    ],
  },
  {
    version: "3.0",
    date: "2026-06-04",
    changes: [
      "Applications are saved to the online database (Supabase), so they show in the Rental Manager on any device straight away.",
      "If the internet connection fails, the application is kept on the phone and sent later.",
    ],
  },
  {
    version: "2.0",
    date: "2026-06",
    changes: [
      "Standalone application form (separate link to share with applicants).",
      "Car park options: outside (free) or undercover (extra cost).",
      "Emergency contact: name, relationship and phone.",
      "G&Q navy and gold design.",
    ],
  },
  { version: "1.0", date: "2026", changes: ["First version of the room application form."] },
];

export const APP_VERSION = CHANGELOG[0].version;

export function VersionBadge({ dark = true }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} title="Version history"
        style={{ marginLeft: "auto", background: dark ? "rgba(255,255,255,0.12)" : "#f0ece4", border: "1px solid rgba(255,255,255,0.25)", color: dark ? "#fff" : "#1b2a4a", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        📋 v{APP_VERSION}
      </button>
      {open && (
        <div onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, maxWidth: 560, width: "100%", maxHeight: "88vh", overflowY: "auto", fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#1b2a4a" }}>Version history</div>
              <button onClick={() => setOpen(false)} style={{ background: "#f0ece4", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, cursor: "pointer" }}>Close</button>
            </div>
            {CHANGELOG.map((e) => (
              <div key={e.version} style={{ borderTop: "1px solid #f0ece4", padding: "12px 0" }}>
                <div style={{ fontWeight: 800, color: "#1b2a4a" }}>v{e.version} <span style={{ fontWeight: 500, color: "#888", fontSize: 13 }}>· {e.date}</span></div>
                <ul style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 13, color: "#333", lineHeight: 1.5 }}>
                  {e.changes.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
