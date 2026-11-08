// G&Q contract end-date rule (v4.77)
// A fixed-term contract runs for 6 months unless an end date has been confirmed.
// Default end = start + 6 months - 1 day (e.g. 08/11/2026 -> 07/05/2027),
// the same way most existing G&Q contracts are set up.
// An end date that is empty, invalid, or on/before the start date is treated as NOT confirmed.

const pad = (n) => String(n).padStart(2, "0");

function parseIso(s) {
  const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? { y: +m[1], mo: +m[2], d: +m[3] } : null;
}

// "YYYY-MM-DD" -> "YYYY-MM-DD" six months later, minus one day ("" if no valid start)
export function defaultEndDate(startIso) {
  const p = parseIso(startIso);
  if (!p) return "";
  let y = p.y, mo = p.mo + 6;
  if (mo > 12) { mo -= 12; y += 1; }
  const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate(); // days in target month
  const d = new Date(Date.UTC(y, mo - 1, Math.min(p.d, lastDay)));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

// True when the end date is a real date after the start date
export function isEndDateValid(startIso, endIso) {
  return !!parseIso(startIso) && !!parseIso(endIso) && String(endIso).slice(0, 10) > String(startIso).slice(0, 10);
}

// The end date to use for a fixed-term contract: the confirmed one if valid, otherwise the 6-month default
export function effectiveEndDate(startIso, endIso) {
  return isEndDateValid(startIso, endIso) ? String(endIso).slice(0, 10) : defaultEndDate(startIso);
}

// When the start date changes on a form: keep a valid end date the person chose,
// otherwise fill in the 6-month default. prevStart lets us move an auto-filled date along with the start.
export function endAfterStartChange(prevStart, newStart, currentEnd) {
  if (!currentEnd || currentEnd === defaultEndDate(prevStart) || !isEndDateValid(newStart, currentEnd)) {
    return defaultEndDate(newStart);
  }
  return currentEnd;
}
