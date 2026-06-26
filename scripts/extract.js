import fs from 'fs';

const raw = fs.readFileSync('backups/db_data/reports.json', 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.log("JSON parse error:", e);
  process.exit(1);
}

const reports = [];
const partialReports = [];

function extract(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(extract);
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.facilityName && obj.id) {
      reports.push(obj);
    } else if (obj.reports) {
      if (obj.id && !obj.facilityName) {
         partialReports.push(obj);
      }
      extract(obj.reports);
    } else {
       Object.values(obj).forEach(extract);
    }
  }
}

extract(data);

const uniqueReportsMap = new Map();
// First add full reports
for (const r of reports) {
  uniqueReportsMap.set(r.id, r);
}
// Then see if we can merge partial ones
for (const pr of partialReports) {
  if (uniqueReportsMap.has(pr.id)) {
     const existing = uniqueReportsMap.get(pr.id);
     if (pr.ticketNo) existing.ticketNo = pr.ticketNo;
     if (pr.billing) existing.billing = pr.billing;
  } else {
     uniqueReportsMap.set(pr.id, pr); // although it's incomplete
  }
}

const uniqueReports = Array.from(uniqueReportsMap.values());
uniqueReports.sort((a,b) => {
    if (a.id && b.id) return a.id.localeCompare(b.id);
    return 0;
});

console.log(`Found ${uniqueReports.length} unique reports.`);
fs.writeFileSync('backups/db_data/reports.json', JSON.stringify(uniqueReports, null, 2));
