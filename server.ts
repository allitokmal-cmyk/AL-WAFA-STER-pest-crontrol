import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Simple persistent JSON Database setup
const DB_DIR = path.join(process.cwd(), "db_data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getFilePath(filename: string) {
  return path.join(DB_DIR, filename);
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading database file ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T) {
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing database file ${filename}:`, err);
  }
}

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Gemini SDK with custom User-Agent for tracking
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in Smart Offline Simulation Mode.");
}

// Global active in-memory database of treatment reports and inventory to simulate real ERP syncing
interface Report {
  id: string;
  facilityName: string;
  clientId: string;
  contractNo: string;
  branchName: string;
  facilityType: string;
  emirate: string;
  address: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  email: string;
  startDate: string;
  endDate: string;
  validity: string;
  dateOfOperation: string;
  ticketNo: string;
  startTime: string;
  endTime: string;
  duration: string;
  categories: string[];
  areas: string[];
  reportText: string;
  workStatus: string;
  methods: string[];
  chemicals: {
    name: string;
    dilution: string;
    used: string;
    batch: string;
    expiry: string;
    remaining: string;
  }[];
  infestation: Record<string, string>;
  sanitation: string;
  proofing: string;
  recommendations: string[];
  billing: {
    invoiceNo: string;
    invoiceDate: string;
    amount: number;
    discount: number;
    vat: number;
    total: number;
    method: string;
    status: string;
  };
  technicians: string[];
  signatures: {
    client?: string;
    technician?: string;
    supervisor?: string;
  };
}

// Seeding standard data
let mockReports: Report[] = readJsonFile<Report[]>("reports.json", []);
if (mockReports.length === 0) {
  mockReports = [
  {
    id: "REP-2026-001",
    facilityName: "Al Hamidiyah Health Center",
    clientId: "ALW-CLI-3901",
    contractNo: "CON-4820-A",
    branchName: "Ajman Main Sector",
    facilityType: "Health Center",
    emirate: "Ajman",
    address: "Al Hamidiyah, Ajman Near Post Office",
    contactPerson: "Dr. Amna Al Shamsi",
    mobile: "+971 50 123 4567",
    whatsapp: "+971 50 123 4567",
    email: "hamidiyah.hc@moh.gov.ae",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    validity: "Quarterly",
    dateOfOperation: "2026-05-24",
    ticketNo: "TKT-39102-AQ",
    startTime: "08:30",
    endTime: "10:15",
    duration: "1h 45m",
    categories: ["General Pest Control (GPC)", "Rodent Control (RCP)", "Flying Insect Control (FICP)"],
    areas: ["Rooms", "Kitchen", "Pantry", "Common Area", "Drainage"],
    reportText: "Full floor treatment spraying completed for general ward clinics, kitchen, staff pantry, toilets, and peripheral outdoor main drainage. Standard residual treatment applied for crawling insects. Rodent monitoring stations inspected and 2 traps re-baited with Advion rodent block.",
    workStatus: "Completed",
    methods: ["Spraying", "Residual Treatment", "Gel Baiting", "Trapping"],
    chemicals: [
      { name: "Deltacide SC", dilution: "10ml / 1L", used: "75ml", batch: "DT-2025-X8", expiry: "2027-11-20", remaining: "4.25L" },
      { name: "Advion Gel", dilution: "N/A", used: "5g", batch: "AG-9426", expiry: "2028-04-15", remaining: "120g" },
      { name: "Cypermethrin", dilution: "5ml / 1L", used: "50ml", batch: "CP-441-S", expiry: "2027-08-10", remaining: "1.85L" }
    ],
    infestation: {
      Cockroach: "Low",
      Mosquito: "None",
      "Drain Fly": "Low",
      Rodent: "Medium",
      "Bed Bug": "None",
      Ants: "Low"
    },
    sanitation: "Good",
    proofing: "Satisfactory",
    recommendations: ["Improve kitchen cleaning schedule", "Keep drainage covered"],
    billing: {
      invoiceNo: "INV-2026-0012",
      invoiceDate: "2026-05-24",
      amount: 1200,
      discount: 100,
      vat: 55,
      total: 1155,
      method: "Bank Transfer",
      status: "Paid"
    },
    technicians: ["Hussin", "Ahmed"],
    signatures: {
      client: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 20 Q30 10 50 30 T90 10' stroke='black' stroke-width='2' fill='none'/></svg>",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  },
  {
    id: "REP-2026-002",
    facilityName: "Al Kuwait Hospital",
    clientId: "ALW-CLI-4028",
    contractNo: "CON-9921-X",
    branchName: "Dubai Deira Branch",
    facilityType: "Hospital",
    emirate: "Dubai",
    address: "Al Kuwait Hospital, Sabkha, Deira, Dubai",
    contactPerson: "Eng. Sayed Abdul Rahman",
    mobile: "+971 52 555 1294",
    whatsapp: "+971 52 555 1294",
    email: "s.rahman@kuwaithospital.ae",
    startDate: "2025-10-10",
    endDate: "2026-10-09",
    validity: "Monthly",
    dateOfOperation: "2026-05-25",
    ticketNo: "TKT-41235-DB",
    startTime: "21:00",
    endTime: "23:30",
    duration: "2h 30m",
    categories: ["Flying Insect Control (FICP)", "Mosquito Fogging", "Sanitization Service"],
    areas: ["Utility Area", "Outdoor Area", "Basement", "Garden", "Drainage"],
    reportText: "Thermal outdoor mosquito fogging conducted across hospital boundary bushes, garden walks, and parking lots. Sub-basement utilities treated for drain fly infestations. Hand sanitization and surface disinfection performed on loading bays.",
    workStatus: "Completed",
    methods: ["Fogging", "Spraying", "Residual Treatment", "Space Treatment"],
    chemicals: [
      { name: "Deltacide SC", dilution: "10ml / 1L", used: "120ml", batch: "DT-2025-X8", expiry: "2027-11-20", remaining: "4.13L" },
      { name: "Cypermethrin", dilution: "5ml / 1L", used: "100ml", batch: "CP-441-S", expiry: "2027-08-10", remaining: "1.75L" }
    ],
    infestation: {
      Cockroach: "None",
      Mosquito: "High",
      "Drain Fly": "Medium",
      Rodent: "Low",
      "Bed Bug": "None",
      Ants: "None"
    },
    sanitation: "Satisfactory",
    proofing: "Good",
    recommendations: ["Keep drainage covered", "Maintain waste disposal schedule"],
    billing: {
      invoiceNo: "INV-2026-0015",
      invoiceDate: "2026-05-25",
      amount: 2500,
      discount: 250,
      vat: 112.5,
      total: 2362.5,
      method: "Bank Transfer",
      status: "Pending"
    },
    technicians: ["Hamdy", "Hussin"],
    signatures: {
      client: "",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  },
  {
    id: "REP-2026-003",
    facilityName: "Smart Salem Medical Fitness Centre",
    clientId: "ALW-CLI-4030",
    contractNo: "CON-3801-S",
    branchName: "Dubai City Walk",
    facilityType: "Medical Center",
    emirate: "Dubai",
    address: "City Walk, Building 3, Al Wasl Road, Dubai",
    contactPerson: "Mr. Saeed Al Falasi",
    mobile: "+971 55 401 2284",
    whatsapp: "+971 55 401 2284",
    email: "info@smartsalem-fitness.ae",
    startDate: "2026-01-15",
    endDate: "2027-01-14",
    validity: "Monthly",
    dateOfOperation: "2026-05-22",
    ticketNo: "TKT-19283-SL",
    startTime: "22:00",
    endTime: "23:45",
    duration: "1h 45m",
    categories: ["General Pest Control (GPC)", "Sanitization Service"],
    areas: ["Rooms", "Common Area", "Pantry", "Toilets"],
    reportText: "General Pest Control treatment carried out at the premium VIP Medical Fitness zones. Residual spraying to control crawling insects completed using Deltacide SC. Applied Advion Cockroach Gel inside kitchenettes and staff lockers. Completely sanitized check-in counters.",
    workStatus: "Completed",
    methods: ["Spraying", "Residual Treatment", "Gel Baiting"],
    chemicals: [
      { name: "Deltacide SC", dilution: "10ml / 1L", used: "60ml", batch: "DT-2025-X8", expiry: "2027-11-20", remaining: "4.07L" },
      { name: "Advion Gel", dilution: "N/A", used: "3g", batch: "AG-9426", expiry: "2028-04-15", remaining: "117g" }
    ],
    infestation: {
      Cockroach: "Low",
      Mosquito: "None",
      "Drain Fly": "None",
      Rodent: "None",
      "Bed Bug": "None",
      Ants: "Low"
    },
    sanitation: "Good",
    proofing: "Good",
    recommendations: ["Keep pantry doors closed", "Ensure dry mops are used after hours"],
    billing: {
      invoiceNo: "INV-2026-0010",
      invoiceDate: "2026-05-22",
      amount: 1500,
      discount: 0,
      vat: 75,
      total: 1575,
      method: "Online Payment",
      status: "Paid"
    },
    technicians: ["Hamdy", "Ahmed"],
    signatures: {
      client: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M12 25 Q35 15 55 35 T85 15' stroke='black' stroke-width='2' fill='none'/></svg>",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  },
  {
    id: "REP-2026-004",
    facilityName: "Khorfakkan Hospital",
    clientId: "ALW-CLI-5004",
    contractNo: "CON-8422-C",
    branchName: "Sharjah East Coast",
    facilityType: "Hospital",
    emirate: "Sharjah",
    address: "Khorfakkan, Sharjah, near beach road",
    contactPerson: "Mr. Obaid Al Khalfan",
    mobile: "+971 56 304 2201",
    whatsapp: "+971 56 304 2201",
    email: "khorfakkan.hp@moh.gov.ae",
    startDate: "2026-02-01",
    endDate: "2027-01-31",
    validity: "90 Days",
    dateOfOperation: "2026-05-18",
    ticketNo: "TKT-84812-KH",
    startTime: "09:00",
    endTime: "12:30",
    duration: "3h 30m",
    categories: ["General Pest Control (GPC)", "Rodent Control (RCP)", "Termite Control & Barrier"],
    areas: ["Rooms", "Kitchen", "Pantry", "Common Area", "Drainage", "Outdoor Area"],
    reportText: "Extensive hospital interior and perimeter check-up. Placed 15 bait boxes in high-sensitivity external loading docks and utility yards due to coastal rodent activity. Applied gel baiting across emergency kitchens and sterile staff zones.",
    workStatus: "Completed",
    methods: ["Spraying", "Residual Treatment", "Trapping", "Gel Baiting"],
    chemicals: [
      { name: "Deltacide SC", dilution: "10ml / 1L", used: "150ml", batch: "DT-2025-X8", expiry: "2027-11-20", remaining: "3.92L" },
      { name: "Advion Gel", dilution: "N/A", used: "10g", batch: "AG-9426", expiry: "2028-04-15", remaining: "107g" }
    ],
    infestation: {
      Cockroach: "Medium",
      Mosquito: "Low",
      "Drain Fly": "Low",
      Rodent: "High",
      "Bed Bug": "None",
      Ants: "Medium"
    },
    sanitation: "Satisfactory",
    proofing: "Satisfactory",
    recommendations: ["Repair broken seals in cafeteria backend door", "Schedule deep cleaning of medical store drainage"],
    billing: {
      invoiceNo: "INV-2026-0008",
      invoiceDate: "2026-05-18",
      amount: 3200,
      discount: 200,
      vat: 150,
      total: 3150,
      method: "Bank Transfer",
      status: "Paid"
    },
    technicians: ["Hussin", "Ahmed"],
    signatures: {
      client: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M15 15 L45 35 L75 5 L95 25' stroke='black' stroke-width='2' fill='none'/></svg>",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  },
  {
    id: "REP-2026-005",
    facilityName: "Maple Clinic",
    clientId: "ALW-CLI-3905",
    contractNo: "CON-8821-M",
    branchName: "Ajman Industrial Clinic",
    facilityType: "Clinic",
    emirate: "Ajman",
    address: "Industrial Area 2, Ajman",
    contactPerson: "Dr. John Mathews",
    mobile: "+971 6 742 1192",
    whatsapp: "+971 50 930 4422",
    email: "info@mapleclinic.ae",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    validity: "30 Days",
    dateOfOperation: "2026-05-20",
    ticketNo: "TKT-30239-MC",
    startTime: "14:00",
    endTime: "15:20",
    duration: "1h 20m",
    categories: ["General Pest Control (GPC)", "Bed Bug Eradication"],
    areas: ["Rooms", "Common Area", "Toilets"],
    reportText: "Follow-up bed bug scanning in reception beds and clinical observation couches. Applied specific hot steam treatments combined with targeted micro-residual localized perimeter sprays. Zero active cockroach nymphs found.",
    workStatus: "Completed",
    methods: ["Spraying", "Space Treatment", "Thermal Steam"],
    chemicals: [
      { name: "Cypermethrin", dilution: "5ml / 1L", used: "80ml", batch: "CP-441-S", expiry: "2027-08-10", remaining: "1.67L" }
    ],
    infestation: {
      Cockroach: "None",
      Mosquito: "None",
      "Drain Fly": "None",
      Rodent: "None",
      "Bed Bug": "Low",
      Ants: "Low"
    },
    sanitation: "Good",
    proofing: "Good",
    recommendations: ["Recommend heat-drying of all clinic patient linens", "Keep screening windows closed tight"],
    billing: {
      invoiceNo: "INV-2026-0009",
      invoiceDate: "2026-05-20",
      amount: 950,
      discount: 50,
      vat: 45,
      total: 945,
      method: "Cash",
      status: "Paid"
    },
    technicians: ["Hussin"],
    signatures: {
      client: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M8 28 Q28 8 50 28 T92 18' stroke='black' stroke-width='1.5' fill='none'/></svg>",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  },
  {
    id: "REP-2026-006",
    facilityName: "Family Health Promotion Center",
    clientId: "ALW-CLI-5002",
    contractNo: "CON-3281-B",
    branchName: "Sharjah Sector 3",
    facilityType: "Health Center",
    emirate: "Sharjah",
    address: "Halwan Area, Sharjah",
    contactPerson: "Mrs. Noura Al Nooman",
    email: "familyhealth.shj@moh.gov.ae",
    mobile: "+971 52 110 3381",
    whatsapp: "+971 52 110 3381",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    validity: "Quarterly",
    dateOfOperation: "2026-05-15",
    ticketNo: "TKT-31289-FH",
    startTime: "12:00",
    endTime: "13:45",
    duration: "1h 45m",
    categories: ["Flying Insect Control (FICP)", "Synergized Misting", "General Pest Control (GPC)"],
    areas: ["Pantry", "Common Area", "Rooms", "Toilets", "Drainage"],
    reportText: "General pest control spraying alongside enzymatic sanitization for pediatric play rooms, healthcare desks, common hallways, and toilets. High-density baiting completed for drain fly mitigation inside basement sumps.",
    workStatus: "Completed",
    methods: ["Spraying", "Residual Treatment", "Gel Baiting"],
    chemicals: [
      { name: "Deltacide SC", dilution: "10ml / 1L", used: "50ml", batch: "DT-2025-X8", expiry: "2027-11-20", remaining: "3.87L" },
      { name: "Advion Gel", dilution: "N/A", used: "2g", batch: "AG-9426", expiry: "2028-04-15", remaining: "105g" }
    ],
    infestation: {
      Cockroach: "Low",
      Mosquito: "Medium",
      "Drain Fly": "High",
      Rodent: "None",
      "Bed Bug": "None",
      Ants: "Low"
    },
    sanitation: "Good",
    proofing: "Good",
    recommendations: ["Clean the pediatric common space trash bins twice daily", "Pour biological foam into backend kitchen drains"],
    billing: {
      invoiceNo: "INV-2026-0005",
      invoiceDate: "2026-05-15",
      amount: 1400,
      discount: 100,
      vat: 65,
      total: 1365,
      method: "Bank Transfer",
      status: "Paid"
    },
    technicians: ["Hamdy", "Ahmed"],
    signatures: {
      client: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 15 C40 25 60 5 90 35' stroke='black' stroke-width='2' fill='none'/></svg>",
      technician: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 30 C30 5 70 35 90 20' stroke='blue' stroke-width='1.5' fill='none'/></svg>",
      supervisor: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M5 15 L25 35 L45 5 L65 30 L85 10' stroke='green' stroke-width='2' fill='none'/></svg>"
    }
  }
];
  writeJsonFile("reports.json", mockReports);
}

// In-Memory Chemical Reference & Stocks
let chemicalInventoryRef = readJsonFile<any[]>("inventory.json", []);
if (chemicalInventoryRef.length === 0) {
  chemicalInventoryRef = [
    { name: "Deltacide SC", receivedDate: "2024-05-10", dilution: "10ml / 1L", batch: "DT-2025-X8", expiry: "2027-11-20", stock: 4.25, unit: "L", alertThreshold: 1.0 },
    { name: "Advion Gel", receivedDate: "2024-03-22", dilution: "N/A", batch: "AG-9426", expiry: "2028-04-15", stock: 120, unit: "g", alertThreshold: 20 },
    { name: "Cypermethrin", receivedDate: "2024-06-01", dilution: "5ml / 1L", batch: "CP-441-S", expiry: "2027-08-10", stock: 1.85, unit: "L", alertThreshold: 0.5 }
  ];
  writeJsonFile("inventory.json", chemicalInventoryRef);
}

// In-Memory Chemical Recieved History Logs (Excel-style database)
let chemicalHistoryRef = readJsonFile<any[]>("chemical_history.json", []);
if (chemicalHistoryRef.length === 0) {
  chemicalHistoryRef = [
    { date: "2026-06-12", name: "DEALTA SEET", batch: "0044D", stock: 7, unit: "L", receivedDate: "2026-06-12", expiry: "2026-06-26", dilution: "10 ML 1/L" },
    { date: "2026-06-12", name: "Advion Gel", batch: "AG-9426", stock: 1111, unit: "g", receivedDate: "2026-06-12", expiry: "2028-04-27", dilution: "N/A" },
    { date: "2024-06-01", name: "Cypermethrin", batch: "CP-441-S", stock: 1.75, unit: "L", receivedDate: "2024-06-01", expiry: "2027-08-10", dilution: "5ml / 1L" },
    { date: "2024-05-10", name: "Deltacide SC", batch: "DT-2025-X8", stock: 4.25, unit: "L", receivedDate: "2024-05-10", expiry: "2027-11-20", dilution: "10ml / 1L" }
  ];
  writeJsonFile("chemical_history.json", chemicalHistoryRef);
}

// Offline expert responses based on the uploaded insect type (for simulation/robustness)
const offlinePestDatabase: Record<string, any> = {
  cockroach: {
    pest: "German Cockroach (Blattella germanica)",
    level: "High",
    confidence: "94%",
    description: "Highly active infestation spotted. Identified by two prominent dark longitudinal stripes running from back of head to wings. Prefers hidden cracks, warm appliances, bathrooms, and food prep areas.",
    treatmentMethod: "Gel Baiting & Crack & Crevice residual spraying.",
    chemicalSuggested: "Advion Gel (Indoxacarb 0.6%) & Deltacide SC.",
    dilutionRate: "Adhere to spot gel dots (0.5g/dot) & Deltacide at 10ml per 1 Liter.",
    proofingAdvice: "Seal gap between backsplash and medical table wall counters. Keep dry food storage units locked in airtight bins."
  },
  bedbug: {
    pest: "Common Bed Bug (Cimex lectularius)",
    level: "Medium",
    confidence: "89%",
    description: "Cimex lectularius nymphs and adults observed inside bed structures and behind clinical curtains. Risk of biting medical staff and clinic patients.",
    treatmentMethod: "Residual targeting cracks, steam treatment, and spot spray targeting mattress seams.",
    chemicalSuggested: "Deltacide SC (Deltamethrin base) combined with physical dry steam.",
    dilutionRate: "15ml / 1L water target residual spray.",
    proofingAdvice: "Wash all infected clinic bed linens at 60°C. Repair peeling hospital wallpaper."
  },
  rodent: {
    pest: "Roof Rat / House Mouse (Rattus rattus)",
    level: "High",
    confidence: "91%",
    description: "Droppings and rubber wiring gnawing marks spotted in warehouse sub-cabinets. Poses hygiene hazard to surgical equipment.",
    treatmentMethod: "Rodent baiting with tamper-resistant bait stations plus structural exclusion trap-lining.",
    chemicalSuggested: "Brodifacoum block bait & Glue boards in utility channels.",
    dilutionRate: "N/A (Ready use blocks / glue pads)",
    proofingAdvice: "Block sub-drain pipes with steel wire mesh. Close garden sliding screen door gaps exceeding 6mm."
  },
  fly: {
    pest: "Drain Fly (Psychodidae spp.)",
    level: "Medium",
    confidence: "87%",
    description: "High concentration around washrooms and sink drains. Breeding due to gelatinous bio-film buildup inside plumbing traps.",
    treatmentMethod: "Enzyme bio-clean wash followed by spot space thermal fogging.",
    chemicalSuggested: "Cypermethrin or specialized drain cleansing biocides.",
    dilutionRate: "5ml / 1L spray on perimeter lines and hot water flushing.",
    proofingAdvice: "Scrub primary septic lines weekly. Keep floor traps filled with water seal."
  },
  generic: {
    pest: "Indeterminate Pest Infestation Spotted",
    level: "Low",
    confidence: "70%",
    description: "General creeping or winged organism detected. Treatment advised as preventative measure for clinical facilities.",
    treatmentMethod: "General Pest Control peripheral barrier spraying.",
    chemicalSuggested: "Cypermethrin residual barrier.",
    dilutionRate: "5ml / 1L concentration.",
    proofingAdvice: "Verify screen doors are fitted with appropriate bottom brushes."
  }
};

// API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeDbCount: mockReports.length });
});

// API Get Reports List
app.get("/api/reports", (req, res) => {
  res.json({ success: true, reports: mockReports });
});

// Helper functions for super robust stock matching and deductions
function isChemicalMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  
  if (n1 === n2) return true;
  
  if (n1.length > 3 && n2.length > 3) {
    if (n1.includes(n2) || n2.includes(n1)) return true;
  }
  
  const words1 = name1.toLowerCase().split(/[^a-z0-9]+/);
  const words2 = name2.toLowerCase().split(/[^a-z0-9]+/);
  
  const ignoreWords = ["sc", "ec", "gel", "liquid", "powder", "wp", "wg", "cs", "gr", "ulv", "sl", "sp", "g", "ml", "l"];
  
  const significantWords1 = words1.filter(w => w.length > 2 && !ignoreWords.includes(w));
  const significantWords2 = words2.filter(w => w.length > 2 && !ignoreWords.includes(w));
  
  for (const w1 of significantWords1) {
    for (const w2 of significantWords2) {
      if (w1 === w2) return true;
    }
  }
  
  return false;
}

function parseUsedQuantity(usedStr: string, targetUnit: string): number {
  if (!usedStr) return 0;
  const cleanStr = usedStr.toLowerCase().trim();
  const numericVal = parseFloat(cleanStr);
  if (isNaN(numericVal)) return 0;

  let sourceUnit = "";
  if (cleanStr.includes("ml")) {
    sourceUnit = "ml";
  } else if (cleanStr.includes("l")) {
    sourceUnit = "l";
  } else if (cleanStr.includes("kg")) {
    sourceUnit = "kg";
  } else if (cleanStr.includes("g") || cleanStr.includes("gm") || cleanStr.includes("gram")) {
    sourceUnit = "g";
  } else {
    if (targetUnit.toLowerCase() === "l") {
      sourceUnit = numericVal >= 1.0 && numericVal <= 1000 ? "ml" : "l";
    } else if (targetUnit.toLowerCase() === "g") {
      sourceUnit = "g";
    } else {
      sourceUnit = targetUnit.toLowerCase();
    }
  }

  const s = sourceUnit.toLowerCase();
  const t = targetUnit.toLowerCase();

  if (s === t) {
    return numericVal;
  }

  if (s === "ml" && t === "l") {
    return numericVal / 1000;
  }
  if (s === "l" && t === "ml") {
    return numericVal * 1000;
  }
  if (s === "g" && t === "kg") {
    return numericVal / 1000;
  }
  if (s === "kg" && t === "g") {
    return numericVal * 1000;
  }

  return numericVal;
}

function refundChemicals(chemicals: any[]) {
  if (!chemicals || !Array.isArray(chemicals)) return;
  chemicals.forEach((chem) => {
    const found = chemicalInventoryRef.find(c => isChemicalMatch(c.name, chem.name));
    if (found) {
      const numericUsed = parseUsedQuantity(chem.used, found.unit);
      if (numericUsed > 0) {
        found.stock = parseFloat((found.stock + numericUsed).toFixed(3));
      }
    }
  });
}

function deductChemicals(chemicals: any[]) {
  if (!chemicals || !Array.isArray(chemicals)) return;
  chemicals.forEach((chem) => {
    const found = chemicalInventoryRef.find(c => isChemicalMatch(c.name, chem.name));
    if (found) {
      const numericUsed = parseUsedQuantity(chem.used, found.unit);
      if (numericUsed > 0) {
        found.stock = Math.max(0, parseFloat((found.stock - numericUsed).toFixed(3)));
      }
      chem.remaining = `${found.stock} ${found.unit}`;
    }
  });
}

// API Create Report with Dynamic Stock Deductions
app.post("/api/reports", (req, res) => {
  try {
    const reportData = req.body;
    
    // Auto-generate ID and ticket number if lacking
    const reportId = reportData.id || `REP-2026-${String(mockReports.length + 1).padStart(3, "0")}`;
    const ticketNo = reportData.ticketNo || `TKT-${Math.floor(10000 + Math.random() * 90000)}-AL`;
    const invoiceNo = reportData.billing?.invoiceNo || `INV-2026-${String(mockReports.length + 12).padStart(4, "0")}`;

    const newReport: Report = {
      ...reportData,
      id: reportId,
      ticketNo: ticketNo,
      billing: {
        ...reportData.billing,
        invoiceNo: invoiceNo,
        invoiceDate: reportData.billing?.invoiceDate || new Date().toISOString().split("T")[0],
      }
    };

    // Auto Stock Deductions with robust unit parsing and name matching
    deductChemicals(newReport.chemicals);

    mockReports.unshift(newReport); // Keep newest at the top
    writeJsonFile("reports.json", mockReports);
    writeJsonFile("inventory.json", chemicalInventoryRef);
    res.json({ success: true, report: newReport, currentInventory: chemicalInventoryRef });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Update Report
app.put("/api/reports/:id", (req, res) => {
  try {
    const { id } = req.params;
    const reportData = req.body;
    const idx = mockReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      // Revert old report's chemical stock deductions first
      const oldReport = mockReports[idx];
      refundChemicals(oldReport.chemicals);

      const updatedReport = {
        ...mockReports[idx],
        ...reportData,
        id 
      };

      // Apply new chemical stock deductions
      deductChemicals(updatedReport.chemicals);

      mockReports[idx] = updatedReport;
      writeJsonFile("reports.json", mockReports);
      writeJsonFile("inventory.json", chemicalInventoryRef);
      res.json({ success: true, report: mockReports[idx], currentInventory: chemicalInventoryRef });
    } else {
      // If the report is not found on the server (e.g. transient container restarted),
      // we insert/restore it dynamically and deduct chemicals accordingly.
      const newReport = {
        ...reportData,
        id
      };
      
      deductChemicals(newReport.chemicals);
      
      mockReports.unshift(newReport);
      writeJsonFile("reports.json", mockReports);
      writeJsonFile("inventory.json", chemicalInventoryRef);
      res.json({ success: true, report: newReport, currentInventory: chemicalInventoryRef });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Delete Report
app.delete("/api/reports/:id", (req, res) => {
  try {
    const { id } = req.params;
    const idx = mockReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      // Refund chemicals back to stock upon deletion
      const oldReport = mockReports[idx];
      refundChemicals(oldReport.chemicals);

      mockReports.splice(idx, 1);
      writeJsonFile("reports.json", mockReports);
      writeJsonFile("inventory.json", chemicalInventoryRef);
      res.json({ success: true, id, currentInventory: chemicalInventoryRef });
    } else {
      res.status(404).json({ success: false, message: "Report not found" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Get Chemical Inventory Stocks
app.get("/api/inventory", (req, res) => {
  res.json({ success: true, inventory: chemicalInventoryRef });
});

// API Get Chemical Recieved History Logs
app.get("/api/inventory/history", (req, res) => {
  res.json({ success: true, history: chemicalHistoryRef });
});

// API Add New Chemical / Receive Stock
app.post("/api/inventory/new", (req, res) => {
  const newChem = req.body;
  
  if (!newChem || !newChem.name) {
    return res.status(400).json({ success: false, message: "Invalid chemical data" });
  }

  const stockAdded = parseFloat(newChem.stock) || 0;
  const targetDate = newChem.receivedDate || new Date().toISOString().split('T')[0];

  // Log this transaction into history
  chemicalHistoryRef.unshift({
    date: targetDate,
    name: newChem.name,
    batch: newChem.batch || "N/A",
    stock: stockAdded,
    unit: newChem.unit || "L",
    receivedDate: targetDate,
    expiry: newChem.expiry || "2029-12-31",
    dilution: newChem.dilution || "N/A"
  });
  writeJsonFile("chemical_history.json", chemicalHistoryRef);

  // Check if exists in inventory to update stock balance
  const exists = chemicalInventoryRef.find(c => c.name.toLowerCase() === newChem.name.toLowerCase());
  if (exists) {
    exists.stock = parseFloat((exists.stock + stockAdded).toFixed(3));
    
    // Update other details if provided
    if (newChem.receivedDate && newChem.receivedDate !== "N/A") exists.receivedDate = newChem.receivedDate;
    if (newChem.dilution && newChem.dilution !== "N/A") exists.dilution = newChem.dilution;
    if (newChem.batch && newChem.batch !== "N/A") exists.batch = newChem.batch;
    if (newChem.expiry && newChem.expiry !== "2029-12-31") exists.expiry = newChem.expiry;
    if (newChem.unit) exists.unit = newChem.unit;
    if (newChem.alertThreshold) exists.alertThreshold = parseFloat(newChem.alertThreshold) || exists.alertThreshold || 1.0;

    writeJsonFile("inventory.json", chemicalInventoryRef);
    return res.json({ success: true, inventory: chemicalInventoryRef, accumulated: true });
  }

  chemicalInventoryRef.push({
    name: newChem.name,
    receivedDate: newChem.receivedDate || "N/A",
    dilution: newChem.dilution || "N/A",
    batch: newChem.batch || "N/A",
    expiry: newChem.expiry || "2029-12-31",
    stock: stockAdded,
    unit: newChem.unit || "L",
    alertThreshold: parseFloat(newChem.alertThreshold) || 1.0
  });
  writeJsonFile("inventory.json", chemicalInventoryRef);

  res.json({ success: true, inventory: chemicalInventoryRef });
});

// API Restock Chemical
app.post("/api/inventory/restock", (req, res) => {
  const { name, amount } = req.body;
  const found = chemicalInventoryRef.find(c => c.name === name);
  if (found) {
    found.stock = parseFloat((found.stock + parseFloat(amount)).toFixed(3));
    writeJsonFile("inventory.json", chemicalInventoryRef);
    res.json({ success: true, chemical: found });
  } else {
    res.status(404).json({ success: false, message: "Chemical not found" });
  }
});

// API Delete Chemical
app.delete("/api/inventory/:name", (req, res) => {
  const { name } = req.params;
  const idx = chemicalInventoryRef.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    chemicalInventoryRef.splice(idx, 1);
    writeJsonFile("inventory.json", chemicalInventoryRef);
    res.json({ success: true, inventory: chemicalInventoryRef });
  } else {
    res.status(404).json({ success: false, message: "Chemical not found" });
  }
});

// Server-Side Gemini endpoint for AI Pests Detection
// Considers standard guidelines:
// Uses process.env.GEMINI_API_KEY
// Does NOT send key to client
// Implements fallback with online support
app.post("/api/gemini/detect", async (req, res) => {
  const { imageBase64, keyword, userPrompt } = req.body;

  // Let's first determine if we have a valid keyword that triggers high accuracy local response (as backup or simulation)
  const lookupKey = (keyword || "").toLowerCase();
  let fallbackResponse = offlinePestDatabase.generic;
  
  if (lookupKey.includes("cockroach") || lookupKey.includes("roach")) {
    fallbackResponse = offlinePestDatabase.cockroach;
  } else if (lookupKey.includes("bed") && lookupKey.includes("bug")) {
    fallbackResponse = offlinePestDatabase.bedbug;
  } else if (lookupKey.includes("rat") || lookupKey.includes("mouse") || lookupKey.includes("rodent")) {
    fallbackResponse = offlinePestDatabase.rodent;
  } else if (lookupKey.includes("fly") || lookupKey.includes("drain")) {
    fallbackResponse = offlinePestDatabase.fly;
  }

  // If Gemini API is online, do the actual call
  if (ai) {
    try {
      console.log(`Sending request to Gemini model 'gemini-3.5-flash'`);
      
      let contents: any[] = [];
      let promptString = `You are a Smart AI Pest Control Expert and Medical Health Inspector for Al Wafa Star ERP. 
Identify the pest shown in the image, analyze potential pest risks for medical facilities, and return a structured JSON response.
User inquiry: "${userPrompt || "Analyze this pest and state the medical facility hygiene risks and recommend Al Wafa Star's treatment."}"`;

      if (imageBase64) {
        // Strip data:image/... base64 prefix if existing
        const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanedBase64
          }
        });
      }

      contents.push({ text: promptString });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "Always speak in a highly professional, clinical, objective medical hygiene auditor tone. Give concise structured answers in JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pest: { type: Type.STRING, description: "Common name and scientific name of the pest" },
              level: { type: Type.STRING, description: "Infestation Risk level (Low, Medium, or High)" },
              confidence: { type: Type.STRING, description: "Confidence score percentage" },
              description: { type: Type.STRING, description: "Clinical analysis and risk factors inside clinics or hospitals" },
              treatmentMethod: { type: Type.STRING, description: "Approved treatment method (e.g. Gel Baiting, Residual Spraying)" },
              chemicalSuggested: { type: Type.STRING, description: "Suggested medical-grade chemicals details" },
              dilutionRate: { type: Type.STRING, description: "Safe chemical dosage dilution rate" },
              proofingAdvice: { type: Type.STRING, description: "Professional architectural proofing and sanitation advice" }
            },
            required: ["pest", "level", "confidence", "description", "treatmentMethod", "chemicalSuggested", "dilutionRate", "proofingAdvice"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const resultJson = JSON.parse(responseText.trim());
        return res.json({
          success: true,
          source: "gemini-api",
          data: resultJson
        });
      }
    } catch (apiError: any) {
      console.error("Gemini API Exec Error, utilizing High Fidelity Smart Simulation:", apiError);
      return res.json({
        success: true,
        source: "smart-simulation-engine",
        error: apiError.message,
        data: fallbackResponse
      });
    }
  }

  // default offline / simulation response
  return res.json({
    success: true,
    source: "smart-simulation-engine",
    data: fallbackResponse
  });
});

// API Get & Set Registered Logins
app.get("/api/users", (req, res) => {
  const users = readJsonFile<any[]>("users.json", []);
  res.json({ success: true, users });
});

app.post("/api/users", (req, res) => {
  try {
    const { users } = req.body;
    if (Array.isArray(users)) {
      writeJsonFile("users.json", users);
      res.json({ success: true, message: "Users list synced successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid users list payload" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Get & Set Locations Registry
app.get("/api/locations", (req, res) => {
  const locations = readJsonFile<any[]>("locations.json", []);
  res.json({ success: true, locations });
});

app.post("/api/locations", (req, res) => {
  try {
    const { locations } = req.body;
    if (Array.isArray(locations)) {
      writeJsonFile("locations.json", locations);
      res.json({ success: true, message: "Locations list synced successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid locations payload" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Get & Set Supervisors Registry
app.get("/api/supervisors", (req, res) => {
  const supervisors = readJsonFile<any[]>("supervisors.json", []);
  res.json({ success: true, supervisors });
});

app.post("/api/supervisors", (req, res) => {
  try {
    const { supervisors } = req.body;
    if (Array.isArray(supervisors)) {
      writeJsonFile("supervisors.json", supervisors);
      res.json({ success: true, message: "Supervisors list synced successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid supervisors payload" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Get & Set Engineering Reports
app.get("/api/engineering-reports", (req, res) => {
  const reports = readJsonFile<any[]>("engineering_reports.json", []);
  res.json({ success: true, reports });
});

app.post("/api/engineering-reports", (req, res) => {
  try {
    const { reports } = req.body;
    if (Array.isArray(reports)) {
      writeJsonFile("engineering_reports.json", reports);
      res.json({ success: true, message: "Engineering reports synced successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid engineering reports payload" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Get & Set Custom Branding parameters
app.get("/api/branding", (req, res) => {
  const branding = readJsonFile<any>("branding.json", null);
  res.json({ success: true, branding });
});

app.post("/api/branding", (req, res) => {
  try {
    const branding = req.body;
    if (branding && typeof branding === "object") {
      writeJsonFile("branding.json", branding);
      res.json({ success: true, message: "Branding parameters synced successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid branding payload" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generic Key-Value Store syncing to support multi-device data persistence
app.get("/api/store/:key", (req, res) => {
  const rawKey = req.params.key;
  const safeKey = rawKey.replace(/[^a-zA-Z0-9_]/g, "");
  if (!safeKey) {
    return res.status(400).json({ success: false, message: "Invalid storage key." });
  }
  const filename = `store_${safeKey}.json`;
  const storedData = readJsonFile<any>(filename, null);
  res.json({ success: true, key: safeKey, data: storedData });
});

app.post("/api/store/:key", (req, res) => {
  try {
    const rawKey = req.params.key;
    const safeKey = rawKey.replace(/[^a-zA-Z0-9_]/g, "");
    if (!safeKey) {
      return res.status(400).json({ success: false, message: "Invalid storage key." });
    }
    const { data } = req.body;
    const filename = `store_${safeKey}.json`;
    writeJsonFile(filename, data);
    res.json({ success: true, message: `Storage key [${safeKey}] synced successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to save Firebase credentials directly to src/firebase-applet-config.json
app.post("/api/save-firebase-config", (req, res) => {
  try {
    const configData = req.body;
    const configPath = path.join(process.cwd(), "src", "firebase-applet-config.json");
    
    const cleanConfig = {
      apiKey: configData.apiKey || "",
      authDomain: configData.authDomain || "",
      projectId: configData.projectId || "",
      storageBucket: configData.storageBucket || "",
      messagingSenderId: configData.messagingSenderId || "",
      appId: configData.appId || "",
      measurementId: configData.measurementId || "",
      firestoreDatabaseId: configData.firestoreDatabaseId || ""
    };
    
    fs.writeFileSync(configPath, JSON.stringify(cleanConfig, null, 2), "utf-8");
    console.log("Firebase configuration saved successfully directly to src/firebase-applet-config.json.");
    res.json({ success: true, message: "Firebase configuration written directly to src/firebase-applet-config.json" });
  } catch (error: any) {
    console.error("Error writing firebase config:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware OR production static hosting Setup
async function launchExpress() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted on Express app.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production build directory serving mounted from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`AL WAFA STAR ERP - SERVER RUNNING ON: http://0.0.0.0:${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`===============================================`);
  });
}

launchExpress().catch((err) => {
  console.error("Failed to boot Express+Vite integration server:", err);
});
