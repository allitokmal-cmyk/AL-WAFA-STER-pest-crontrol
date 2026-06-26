import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  ClipboardCopy, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  Maximize2, 
  Trash2, 
  PlusSquare, 
  Sparkles, 
  Info,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  X,
  PlusCircle,
  Eye,
  Activity,
  User,
  FlaskConical,
  CreditCard,
  Download,
  FileCheck
} from "lucide-react";
import { ReportItem, STANDARD_FACILITIES, EMIRATE_MAPPING_FACILITIES } from "../types";
import { getStoreValue, saveStoreValue, deleteDocument } from "../localDatabase";

const formatFacilityType = (type: string, lang: "en" | "ar" | "bn") => {
  if (!type) return "";
  if (type === "Completed") {
    return lang === "bn" ? "কমপ্লিট" : "Completed";
  }
  if (type === "Partially Completed" || type === "In Progress") {
    return lang === "bn" ? "অর্ধেক করা হয়েছে" : "Partially Completed";
  }
  if (type === "Incomplete" || type === "Not Started") {
    return lang === "bn" ? "কমপ্লিট হয়নি" : "Incomplete";
  }
  return type;
};

interface ClientDirectoryProps {
  onSelectClientToPrefill: (client: any) => void;
  language: "en" | "ar" | "bn";
  reports: ReportItem[];
  onUpdateReports: (newReports: ReportItem[]) => void;
}

export const generateReportHTML = (report: any, language: string) => {
    const slNo = report.id.split('-')[1] || "0230";

    const serviceCategories = ["Basic", "Follow Up", "Call Back", "Replenishing", "Free", "Sample"];
    const treatmentScopes = ["GPC", "FICP", "RCP", "TCP", "BCP", "SCP"];
    const appMethods = ["Spraying", "Trapping", "Dusting", "Baiting", "Repellents", "IGR's"];
    const treatMethods = ["Space Treatment", "Spot Treatment", "Cracks/Crevices", "Band Treatment"];
    const efficacyRatings = ["Residual Treatment", "Knockdown Treatment"];

    const isFreeBilling = !report.billing?.amount || 
                         report.billing?.amount === 0 || 
                         String(report.billing?.amount).toLowerCase().trim() === "no charge" ||
                         String(report.billing?.amount).trim() === "" ||
                         String(report.billing?.amount).trim() === "No";

    let facilityNameStr = "Service Report";
    if (report.facilityName) {
        if (typeof report.facilityName === 'object') {
            facilityNameStr = report.facilityName.name || report.facilityName.facilityName || report.facilityName.label || "Service Report";
        } else {
            facilityNameStr = report.facilityName;
        }
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${facilityNameStr}</title>
    <style>
        * { box-sizing: border-box; }
        @media print {
            @page { size: A4 portrait; margin: 0 !important; }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
            .report-wrapper {
                margin: 4mm auto !important;
                padding: 10mm 12mm !important;
                width: 202mm !important;
                max-width: 202mm !important;
                box-shadow: none !important;
                border: 2px solid #000000 !important;
                outline: 1px double #000000 !important;
                border-radius: 8px !important;
                background-color: #FFFDF3 !important;
                box-sizing: border-box !important;
            }
        }
        .report-wrapper {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background-color: #FFFDF3;
            line-height: 1.4;
            max-width: 210mm;
            margin: 0 auto;
            border: 3px double #000000;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            padding: 24px; 
            position: relative;
        }
        /* Absolute Watermark */
        .watermark-absolute {
           position: absolute;
           top: 50%;
           left: 50%;
           transform: translate(-50%, -50%);
           width: 140mm;
           height: 140mm;
           opacity: 0.05;
           z-index: 0;
           pointer-events: none;
        }
        .watermark-absolute svg { width: 100%; height: 100%; object-fit: contain; }
        
        .header-box { 
            border: 1px solid #000000; 
            padding: 10px; 
            margin-bottom: 12px; 
            background-color: #ffffff; 
            position: relative; 
            z-index: 10; 
            border-radius: 6px;
        }
        
        .header-grid { 
            display: grid; 
            grid-template-columns: 3fr 4fr 3fr; 
            gap: 10px; 
            align-items: center;
        }
        
        .meta-field {
            font-size: 10px;
            font-weight: bold;
            color: #000000;
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .meta-field:last-child {
            margin-bottom: 0;
        }
        
        .meta-label {
            width: 60px;
            flex-shrink: 0;
            font-size: 10px;
            text-transform: uppercase;
        }
        
        .meta-value-container {
            flex-grow: 1;
            border: 1px solid #000000;
            background-color: #ffffff;
            border-radius: 4px;
            padding: 2px 8px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .meta-value-container.sl-no {
            color: #ED1C24;
            font-weight: 900;
            font-size: 11px;
        }
        
        .title-banner {
            background-color: #0f172a;
            color: #ffffff;
            text-align: center;
            font-size: 12px;
            font-weight: 900;
            padding: 5px 0;
            margin-top: 10px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-radius: 4px;
        }
        
        .section-box { 
            border: 1px solid #000000; 
            padding: 10px; 
            border-radius: 6px; 
            margin-bottom: 12px; 
            background-color: #ffffff; 
            position: relative; 
            z-index: 10; 
        }
        
        .section-header { 
            font-size: 10px; 
            font-weight: 900; 
            color: #0f172a; 
            text-transform: uppercase; 
            border-bottom: 1.5px dashed #cbd5e1; 
            padding-bottom: 3px; 
            margin-bottom: 6px; 
        }
        
        .checkbox-grid { 
            display: grid; 
            gap: 6px; 
            font-size: 9.5px; 
        }
        
        .checkbox-item { 
            display: flex; 
            align-items: center; 
        }
        
        .checkbox-box {
            width: 13px;
            height: 13px;
            border: 1px solid #10b981;
            border-radius: 3px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            color: #10b981;
            background-color: #f0fdf4;
            margin-right: 6px;
            flex-shrink: 0;
            line-height: 1;
        }
        
        .checkbox-box.unchecked {
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            color: transparent;
        }
        
        /* Circular radio style */
        .circular-radio {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1.5px solid #cbd5e1;
            display: inline-block;
            margin-right: 5px;
            flex-shrink: 0;
        }
        
        .circular-radio.active {
            border: 1.5px solid #10b981;
            background-color: #10b981;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .circular-radio.active::after {
            content: "✔";
            color: #ffffff;
            font-size: 7px;
            font-weight: bold;
        }
        
        .grid-three { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 12px; 
            margin-bottom: 12px; 
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9.5px; 
            position: relative; 
            z-index: 10; 
            background: #ffffff;
        }
        
        th, td { 
            border: 1px solid #000000; 
            padding: 5px 6px; 
            text-align: left; 
        }
        
        th { 
            background-color: #0f172a; 
            color: #ffffff;
            font-weight: bold; 
            text-transform: uppercase;
            font-size: 9px;
        }
        
        .text-area-box { 
            font-size: 10px; 
            color: #334155; 
            min-height: 45px; 
            padding: 6px; 
            white-space: pre-wrap; 
            font-family: monospace; 
            line-height: 1.4;
        }
        
        .table-check-box {
            width: 14px;
            height: 14px;
            border: 1px solid #475569;
            border-radius: 3px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            font-size: 10px;
            font-weight: bold;
            color: #1e3b8a;
            background: #ffffff;
            line-height: 1;
        }
        
        .table-check-box.checked {
            border-color: #1e3a8a;
            background-color: #eff6ff;
            color: #1e3a8a;
        }
        
        .signature-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 10px; 
            position: relative; 
            z-index: 10; 
        }
        
        .sig-container { 
            text-align: center; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 8px; 
            background: #ffffff; 
        }
        
        .sig-img { 
            max-height: 45px; 
            max-width: 100%; 
            object-fit: contain; 
            display: block; 
            margin: 4px auto; 
        }
        
        .sig-placeholder { 
            height: 45px; 
            line-height: 45px; 
            font-size: 9px; 
            color: #cbd5e1; 
            border: 1px dashed #cbd5e1; 
            border-radius: 4px; 
            margin: 4px auto; 
            text-transform: uppercase; 
            font-weight: bold;
        }
        
        .letterhead-footer { 
            border-top: 1.5px solid #000000; 
            padding-top: 8px; 
            margin-top: 12px; 
            text-align: center; 
            font-size: 7.5px; 
            font-weight: bold; 
            color: #334155; 
            line-height: 1.4; 
            position: relative; 
            z-index: 10; 
        }
    </style>
</head>
<body>
    <div class="report-wrapper">
        <!-- Background Watermark Star -->
        <div class="watermark-absolute">
            <svg viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" /></svg>
        </div>
        
        <table style="width: 100%; border: none; padding: 0; margin: 0; border-spacing: 0; background: transparent;">
            <thead style="display: table-header-group;">
                <tr style="border: none;">
                    <td style="padding: 0; border: none; background: transparent;">
                        <!-- HEADER BLOCK -->
                        <div class="header-box">
                            <div class="header-grid">
                                <!-- LEFT COL: SL, DATE, CONTRACT -->
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <div class="meta-field">
                                        <span class="meta-label">SL. No:</span>
                                        <div class="meta-value-container sl-no">${slNo}</div>
                                    </div>
                                    <div class="meta-field">
                                        <span class="meta-label">Date:</span>
                                        <div class="meta-value-container">${report.dateOfOperation}</div>
                                    </div>
                                    <div class="meta-field">
                                        <span class="meta-label">Contract:</span>
                                        <div class="meta-value-container">${report.contractNo || 'CON-PRE-2026'}</div>
                                    </div>
                                </div>
                                
                                <!-- CENTER COL: IDENTITY BLOCK -->
                                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <svg viewBox="0 0 100 100" style="width: 32px; height: 32px; flex-shrink: 0; display: block;">
                                        <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" />
                                    </svg>
                                    <div style="text-align: center;">
                                        <div style="font-size: 13px; font-weight: bold; color: #000000; font-family: Georgia, serif; line-height: 1.2;">نجمة الوفاء</div>
                                        <div style="font-size: 13px; font-weight: 900; color: #ED1C24; font-family: Arial, sans-serif; letter-spacing: 0.1px; line-height: 1.1;">
                                            AL WAFA STAR
                                        </div>
                                        <div style="font-size: 8.5px; font-weight: bold; color: #ED1C24; font-family: Arial, sans-serif; line-height: 1;">Pest Control Services</div>
                                        <div style="display: inline-block; background-color: #000000; color: #FFD700; font-size: 7px; font-weight: 950; padding: 2px 10px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; border: 1.2px solid #FFD700; line-height: 1;">
                                            PEST CONTROL DIVISION
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- RIGHT COL: BLANK TO ENSURE BALANCED LOGO POSITION -->
                                <div></div>
                            </div>
                            
                            <div class="title-banner">TREATMENT REPORT</div>
                        </div>
                    </td>
                </tr>
            </thead>
            
            <tbody style="display: table-row-group;">
                <tr style="border: none;">
                    <td style="padding: 0; border: none; background: transparent;">
                        <!-- CLIENT & DETAILS BLOCK: 2 Column table layout to prevent Flex wrap issues on older engines -->
                        <div style="border: 1px solid #000000; background-color: #ffffff; padding: 10px; margin-bottom: 12px; border-radius: 6px; position: relative; z-index: 10;">
                            <table style="width: 100%; border: none; margin: 0; padding: 0; background: transparent;">
                                <tr style="border: none;">
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 130px; text-transform: uppercase;">Client Name:</strong><span style="color: #000000; font-weight: bold; text-transform: uppercase; font-size: 10px;">${facilityNameStr}</span></div>
                                    </td>
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 110px; text-transform: uppercase;">Address:</strong><span style="color: #000000; font-weight: bold; text-transform: uppercase; font-size: 10px;">${report.address || report.emirate || 'DUBAI'}</span></div>
                                    </td>
                                </tr>
                                <tr style="border: none;">
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 130px; text-transform: uppercase;">Contact No:</strong><span style="color: #000000; font-weight: bold;">${report.mobile || 'Optional'}</span></div>
                                    </td>
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 110px; text-transform: uppercase;">Email:</strong><span style="color: #000000; font-weight: bold; text-transform: none;">${report.email || 'Optional'}</span></div>
                                    </td>
                                </tr>
                                <tr style="border: none;">
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 130px; text-transform: uppercase;">Time Start:</strong><span style="color: #000000; font-weight: bold;">${report.startTime || 'N/A'}</span></div>
                                    </td>
                                    <td style="width: 50%; border: none; padding: 2px 0; background: transparent; vertical-align: middle;">
                                        <div style="font-size: 10px; display: flex; align-items: center;"><strong style="color: #475569; width: 110px; text-transform: uppercase;">Time End:</strong><span style="color: #000000; font-weight: bold;">${report.endTime || 'N/A'}</span></div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- CHECKLISTS & SCOPE GRID (Side-By-Side with 2 Columns table) -->
                        <table style="width: 100%; border: none; border-collapse: separate; border-spacing: 12px 0; margin: 0 -12px; background: transparent; margin-bottom: 12px;">
                            <tr style="border: none;">
                                <td style="width: 50%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <!-- Service Checklists -->
                                    <div class="section-box" style="margin-bottom: 0;">
                                        <div class="section-header">Service Checklists:</div>
                                        <div class="checkbox-grid" style="grid-template-columns: repeat(2, 1fr);">
                                            ${serviceCategories.map(item => {
                                                const isChecked = report.categories?.some((c: any) => c && typeof c === "string" && c.toLowerCase() === item.toLowerCase()) || 
                                                                  report.methods?.some((m: any) => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                                                return `<div class="checkbox-item">
                                                    <span class="checkbox-box ${isChecked ? '' : 'unchecked'}">✔</span>
                                                    <span style="font-weight: bold;">${item}</span>
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </td>
                                
                                <td style="width: 50%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <!-- Treatment Scope -->
                                    <div class="section-box" style="margin-bottom: 0;">
                                        <div class="section-header">Treatment Scope (ABBR):</div>
                                        <div class="checkbox-grid" style="grid-template-columns: repeat(2, 1fr);">
                                            ${treatmentScopes.map(item => {
                                                const isChecked = report.categories?.some((c: any) => {
                                                  if (!c || typeof c !== "string") return false;
                                                  const lc = c.toLowerCase();
                                                  return lc === item.toLowerCase() || lc === `${item.toLowerCase()} treatment` || lc.startsWith(item.toLowerCase() + " ");
                                                });
                                                return `<div class="checkbox-item">
                                                    <span class="checkbox-box ${isChecked ? '' : 'unchecked'}">✔</span>
                                                    <span style="font-weight: bold;">${item}</span>
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <!-- COVERED AREAS -->
                        <div class="section-box">
                            <div class="section-header">Covered Area Details & Findings:</div>
                            <div class="text-area-box">${report.areas && report.areas.length > 0 ? report.areas.join('\\n') : (language === "bn" ? "কোন বিবরণ নেই" : "No details recorded")}</div>
                        </div>

                        <!-- GRID OF METHOD OF APPLICATION, TREATMENT, EFFICACY (3 Columns using table to prevent breaking) -->
                        <table style="width: 100%; border: none; border-collapse: separate; border-spacing: 12px 0; margin: 0 -12px; background: transparent; margin-bottom: 12px;">
                            <tr style="border: none;">
                                <!-- Application Method -->
                                <td style="width: 33.33%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <div class="section-box" style="margin-bottom: 0; min-height: 120px;">
                                        <div class="section-header">Method of Application:</div>
                                        <div style="font-size: 8.5px; line-height: 1.5;">
                                            ${appMethods.map(item => {
                                                const isChecked = report.methods?.some((m: any) => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                                                return `<div style="display:flex; align-items:center; margin-bottom: 2px;">
                                                    <span class="checkbox-box ${isChecked ? '' : 'unchecked'}" style="width:11px; height:11px; font-size:8px; margin-right:4px;">✔</span>
                                                    <span style="font-weight:900;">${item}</span>
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Treatment Method -->
                                <td style="width: 33.33%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <div class="section-box" style="margin-bottom: 0; min-height: 120px;">
                                        <div class="section-header">Method of Treatment:</div>
                                        <div style="font-size: 8.5px; line-height: 1.5;">
                                            ${treatMethods.map(item => {
                                                const isChecked = report.methods?.some((m: any) => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                                                return `<div style="display:flex; align-items:center; margin-bottom: 2px;">
                                                    <span class="checkbox-box ${isChecked ? '' : 'unchecked'}" style="width:11px; height:11px; font-size:8px; margin-right:4px;">✔</span>
                                                    <span style="font-weight:900;">${item}</span>
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Efficacy Rating -->
                                <td style="width: 33.33%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <div class="section-box" style="margin-bottom: 0; min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
                                        <div>
                                            <div class="section-header">Effectiveness / Efficacy:</div>
                                            <div style="font-size: 8.5px; line-height: 1.5;">
                                                ${efficacyRatings.map(item => {
                                                    const isChecked = report.methods?.some((m: any) => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                                                    return `<div style="display:flex; align-items:center; margin-bottom: 3px;">
                                                        <span class="checkbox-box ${isChecked ? '' : 'unchecked'}" style="width:11px; height:11px; font-size:8px; margin-right:4px;">✔</span>
                                                        <span style="font-weight:900;">${item}</span>
                                                    </div>`;
                                                }).join('')}
                                            </div>
                                        </div>
                                        <div style="margin-top: 5px; padding: 2px 4px; background-color: #FEF9C3; border: 1px solid #FEF08A; border-radius: 4px; display: flex; align-items: center; gap: 2px; font-size: 7.5px; color: #854D0E; font-weight: bold; line-height: 1;">
                                            <span style="font-size: 9px; margin-right: 1px;">🛡️</span> safe formula values
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <!-- INFESTATION MONITORING TABLE -->
                        <div class="section-box" style="page-break-inside: avoid; break-inside: avoid;">
                            <div class="section-header">4. Infestation Monitoring Table / Detailed Incidence Matrix:</div>
                            <table class="pest-table">
                                <thead>
                                    <tr>
                                        <th style="width: 35%; text-align: left;">Pest Type / Species</th>
                                        <th style="width: 10%; text-align: center;">None</th>
                                        <th style="width: 10%; text-align: center;">Low</th>
                                        <th style="width: 10%; text-align: center;">Medium</th>
                                        <th style="width: 10%; text-align: center;">High</th>
                                        <th style="width: 25%; text-align: left;">Findings Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.keys(report.infestation || {}).length > 0 ? Object.entries(report.infestation).map(([key, level]: any) => {
                                        const match = key.match(/^([^(]+)(?:\\s*\\(([^)]+)\\))?/);
                                        const pestName = match ? match[1].trim() : key;
                                        const findingsLocation = (match && match[2]) ? match[2].trim() : "N/A";
                                        const currentLevel = (String(level || "None")).trim().toLowerCase();
                                        return `<tr>
                                            <td style="font-weight: bold; font-size: 9px; text-transform: uppercase;">${pestName}</td>
                                            <td style="text-align: center; vertical-align: middle;">
                                                <div class="table-check-box ${currentLevel === 'none' ? 'checked' : ''}">${currentLevel === 'none' ? '✔' : ''}</div>
                                            </td>
                                            <td style="text-align: center; vertical-align: middle;">
                                                <div class="table-check-box ${currentLevel === 'low' ? 'checked' : ''}">${currentLevel === 'low' ? '✔' : ''}</div>
                                            </td>
                                            <td style="text-align: center; vertical-align: middle;">
                                                <div class="table-check-box ${currentLevel === 'medium' ? 'checked' : ''}">${currentLevel === 'medium' ? '✔' : ''}</div>
                                            </td>
                                            <td style="text-align: center; vertical-align: middle;">
                                                <div class="table-check-box ${currentLevel === 'high' ? 'checked' : ''}">${currentLevel === 'high' ? '✔' : ''}</div>
                                            </td>
                                            <td style="font-size: 8.5px; text-transform: uppercase; font-weight: bold;">${findingsLocation}</td>
                                        </tr>`;
                                    }).join('') : `
                                        <tr>
                                            <td colspan="6" style="text-align: center; font-style: italic; color: #64748b; padding: 10px;">
                                                ${language === "bn" ? "কোন উপদ্বব রিপোর্ট নেই" : "No infestation metrics recorded"}
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- CHEMICAL DOSAGES TABLE IN SEPARATE ROW TO PREVENT SPLITTING -->
                <tr style="border: none; page-break-inside: avoid; break-inside: avoid;">
                    <td style="padding: 0; border: none; background: transparent;">
                        <div class="section-box" style="page-break-inside: avoid; break-inside: avoid;">
                            <div class="section-header">5. Chemical Dosages & Dilution Doses Registered:</div>
                            <table class="chemical-table">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; width: 35%;">Chemical Name</th>
                                        <th style="text-align: left; width: 20%;">Dilution Rate</th>
                                        <th style="text-align: left; width: 15%;">Qty Spec</th>
                                        <th style="text-align: left; width: 15%;">Batch Number</th>
                                        <th style="text-align: left; width: 15%;">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.chemicals && report.chemicals.length > 0 ? report.chemicals.map((chem: any) => `
                                        <tr>
                                            <td style="font-weight: bold; text-transform: uppercase; font-size: 9px;">${chem.name}</td>
                                            <td style="font-weight: bold;">${chem.dilution || 'N/A'}</td>
                                            <td style="font-weight: bold; color: #ef1c24;">${chem.used || '0'}</td>
                                            <td style="font-family: monospace; font-weight: bold;">${chem.batch || 'N/A'}</td>
                                            <td style="font-family: monospace; font-weight: bold;">${chem.expiry || 'N/A'}</td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="5" style="text-align: center; font-style: italic; color: #64748b; padding: 10px;">
                                                ${language === "bn" ? "কোন রাসায়নিক ব্যবহার করা হয়নি" : "No chemical material usage logs"}
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>

                <tr style="border: none;">
                    <td style="padding: 0; border: none; background: transparent;">
                        <!-- SANITARY RATINGS & CREW -->
                        <table style="width: 100%; border: none; border-collapse: separate; border-spacing: 12px 0; margin: 0 -12px; background: transparent; margin-bottom: 12px;">
                            <tr style="border: none;">
                                <td style="width: 50%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <div class="section-box" style="margin-bottom: 0;">
                                        <div class="section-header">Sanitation Conditions:</div>
                                        <div>
                                            <div style="display: flex; gap: 10px;">
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #475569;">
                                                    <span class="circular-radio ${report.sanitation?.toLowerCase() === 'poor' ? 'active' : ''}"></span> Poor
                                                </div>
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #475569;">
                                                    <span class="circular-radio ${report.sanitation?.toLowerCase() === 'satisfactory' ? 'active' : ''}"></span> Satisfactory
                                                </div>
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #020617;">
                                                    <span class="circular-radio ${(!report.sanitation || report.sanitation?.toLowerCase() === 'good') ? 'active' : ''}"></span> Good
                                                </div>
                                            </div>
                                            <div style="font-size: 8px; color: #475569; margin-top: 6px; font-family: monospace;">
                                                Remarks: <span style="font-weight: bold; color: #000;">${report.sanitationRemarks || 'No remarks.'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <td style="width: 50%; padding: 0; border: none; background: transparent; vertical-align: top;">
                                    <div class="section-box" style="margin-bottom: 0;">
                                        <div class="section-header">Proofing Conditions:</div>
                                        <div>
                                            <div style="display: flex; gap: 10px;">
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #475569;">
                                                    <span class="circular-radio ${report.proofing?.toLowerCase() === 'poor' ? 'active' : ''}"></span> Poor
                                                </div>
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #475569;">
                                                    <span class="circular-radio ${report.proofing?.toLowerCase() === 'satisfactory' ? 'active' : ''}"></span> Satisfactory
                                                </div>
                                                <div style="display: flex; align-items: center; font-size: 8.5px; font-weight: bold; color: #020617;">
                                                    <span class="circular-radio ${(!report.proofing || report.proofing?.toLowerCase() === 'good') ? 'active' : ''}"></span> Good
                                                </div>
                                            </div>
                                            <div style="font-size: 8px; color: #475569; margin-top: 6px; font-family: monospace;">
                                                Remarks: <span style="font-weight: bold; color: #000;">${report.proofingRemarks || 'No remarks.'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <!-- RECOMMENDATIONS -->
                        <div class="section-box">
                            <div class="section-header">6. Operational Compliance Advisories / Recommendations:</div>
                            <div style="font-size: 9.5px; color: #1e293b; font-family: monospace; line-height: 1.5; padding: 4px;">
                                ${report.recommendations && report.recommendations.length > 0 ? report.recommendations.map((rec: string, idx: number) => `
                                    <div style="margin-bottom: 3px;"><b>${idx + 1}.</b> ${rec}</div>
                                `).join('') : `
                                    <div><b>1.</b> Kitchen sub-counters must keep dry.</div>
                                    <div style="margin-top: 2px;"><b>2.</b> Repair perimeter screen mesh of the windows.</div>
                                `}
                            </div>
                        </div>

                        <!-- BILLING INVOICE (IF APPLICABLE) -->
                        ${!isFreeBilling ? `
                        <div class="section-box">
                            <div class="section-header">7. Billing Invoice Summary:</div>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; padding: 4px;">
                                <div style="border: 1px solid #cbd5e1; padding: 4px; border-radius: 4px; background: #fff;">
                                    <div style="font-size: 7px; font-weight: bold; color: #64748b; text-transform: uppercase;">Invoice Serial</div>
                                    <div style="font-size: 9px; font-weight: bold; color: #0f172a; margin-top: 2px;">${report.billing?.invoiceNo || `PC-${report.id}`}</div>
                                </div>
                                <div style="border: 1px solid #cbd5e1; padding: 4px; border-radius: 4px; background: #fff;">
                                    <div style="font-size: 7px; font-weight: bold; color: #64748b; text-transform: uppercase;">Subtotal</div>
                                    <div style="font-size: 9px; font-weight: bold; color: #0f172a; margin-top: 2px;">${report.billing?.amount || 0} AED</div>
                                </div>
                                <div style="border: 1px solid #cbd5e1; padding: 4px; border-radius: 4px; background: #fff;">
                                    <div style="font-size: 7px; font-weight: bold; color: #64748b; text-transform: uppercase;">VAT (5%)</div>
                                    <div style="font-size: 9px; font-weight: bold; color: #0f172a; margin-top: 2px;">${report.billing?.vat || 0} AED</div>
                                </div>
                                <div style="border: 1.5px solid #bbf7d0; padding: 4px; border-radius: 4px; background: #f0fdf4;">
                                    <div style="font-size: 7px; font-weight: 800; color: #166534; text-transform: uppercase;">Total Amount</div>
                                    <div style="font-size: 10px; font-weight: 950; color: #166534; margin-top: 1px;">${report.billing?.total || 0} AED</div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- SIGNATURE BLOCK -->
                        <div class="section-box" style="border: none; padding: 0; background: transparent; margin-bottom: 0;">
                            <div class="signature-grid">
                                <div class="sig-container">
                                    <span style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Client Seal / Signature</span>
                                    <div>
                                        ${report.signatures?.client ? `
                                            <img class="sig-img" src="${report.signatures.client}" alt="Client signature"/>
                                        ` : `
                                            <div class="sig-placeholder">[ Clinician Representative ]</div>
                                        `}
                                    </div>
                                    <div style="font-size: 8px; font-weight: bold; color: #1e293b; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 2px; text-transform: uppercase;">
                                        ${report.contactPerson || 'Representative'}
                                    </div>
                                </div>
                                
                                <div class="sig-container">
                                    <span style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Engineer & Technician Signature</span>
                                    <div>
                                        ${report.signatures?.technician || report.signatures?.supervisor ? `
                                            <img class="sig-img" src="${report.signatures.technician || report.signatures.supervisor}" alt="Operator signature"/>
                                        ` : `
                                            <div class="sig-placeholder" style="color:#0369a1; font-weight:bold;">CERTIFIED SECURITY OPERATOR</div>
                                        `}
                                    </div>
                                    <div style="font-size: 8px; font-weight: bold; color: #1e293b; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 2px; text-transform: uppercase;">
                                        AL WAFA Specialist
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- FOOTER LETTERHEAD -->
                        <div class="letterhead-footer">
                            <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.2px;">Tel: 04-2959731, Fax: 04-2959732, P.O Box: 181244, Deira, Dubai - United Arab Emirates</p>
                            <p style="margin: 2px 0 0 0; text-transform: none; color: #ef1c24;">E-mail: pestcontrol@alwafagroupuae.com, wafastaruae@yahoo.com | Website: www.alwafagroupuae.com</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;

    return htmlContent;
};

export const generateEngineeringHTML = (report: any, language: string) => {
    const amountLabel = report.serviceType || "Routine Visit";
    
    let clientNameStr = "Engineering Report";
    if (report.clientName) {
        if (typeof report.clientName === 'object') {
            clientNameStr = report.clientName.name || report.clientName.clientName || report.clientName.label || "Engineering Report";
        } else {
            clientNameStr = report.clientName;
        }
    }

    const isBengali = language === "bn";
    const tLang = (en: string, bn: string) => isBengali ? bn : en;

    const allReportPhotos = (report.photos || []) as { url: string; caption: string; zone?: string; videoUrl?: string; }[];
    const recommendationPhotos = (report.recommendationPhotos || []) as { url: string; caption: string; zone?: string; videoUrl?: string; }[];

    const docTitle = report.reportTitle || `Pest Control Inspection & Treatment Report – ${clientNameStr}`;

    let photoCount = 0;

    // Define standard elegant default bullets if fields are empty
    const defaultPurposeLines = [
        "To monitor mosquito activity following the last treatment conducted in the previous week.",
        "To verify compliance with and effectiveness of the recommendations from the last service visit.",
        "To conduct a routine inspection of manhole areas in order to detect pest activity and implement appropriate preventive measures and treatments."
    ];
    
    const defaultFindingsLines = [
        "Mosquito activity is still observed outside, especially in garden areas near the Maternity and Emergency.",
        "Some manholes contain a significant accumulation of debris, sludge, and organic waste, creating favorable conditions for mosquito breeding, drainage fly development, and American cockroach infestation.",
        "A high presence of mosquitoes was found inside several manholes.",
        "Some plants are heavily infested with mosquitoes.",
        "High infestation rate of American cockroaches observed inside several manholes.",
        "There are maintenance issues inside some manholes, including cracks and gaps in concrete."
    ];

    const defaultRecLines = [
        "Clean all manholes from sludge, debris, and organic accumulation to prevent mosquito breeding.",
        "Apply appropriate larvicide treatments regularly to all water-holding areas and manholes.",
        "Repair concrete cracks and structural gaps in some manholes to prevent insect entry and nesting.",
        "Prune overgrown garden plants and eliminate active standing water vectors immediately."
    ];

    const purposeTextLines = report.purposeOfVisitText ? report.purposeOfVisitText.split('\n').filter((l: string) => l.trim()) : defaultPurposeLines;
    const findingsLines = report.workDetails ? report.workDetails.split('\n').filter((l: string) => l.trim()) : defaultFindingsLines;
    const recLines = report.recommendationText ? report.recommendationText.split('\n').filter((l: string) => l.trim()) : defaultRecLines;

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${clientNameStr}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
        }
        .engineering-report-wrapper {
            max-width: 210mm;
            margin: 30px auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            border: 2px solid #000000;
            outline: 1px double #000000;
            border-radius: 8px;
            padding: 15mm 15mm 20mm 15mm;
            position: relative;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            background: transparent;
        }
        
        thead {
            display: table-header-group !important;
        }
        
        tbody {
            display: table-row-group !important;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            body {
                background-color: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .engineering-report-wrapper {
                margin: 0 !important;
                padding: 15mm 15mm 15mm 15mm !important;
                box-shadow: none !important;
                border: none !important;
                outline: none !important;
                border-radius: 0 !important;
                width: 210mm !important;
                max-width: 210mm !important;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            thead {
                display: table-header-group !important;
            }
            tbody {
                display: table-row-group !important;
            }
            .photo-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        }
        
        /* Absolute Watermark */
        .watermark-absolute {
           position: absolute;
           top: 50%;
           left: 50%;
           transform: translate(-50%, -50%);
           width: 140mm;
           height: 140mm;
           opacity: 0.05;
           z-index: 0;
           pointer-events: none;
        }
        .watermark-absolute svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .header {
            margin-bottom: 25px;
            position: relative;
            z-index: 10;
        }
        .photo-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 15px;
            position: relative;
            z-index: 10;
        }
        .photo-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            background-color: #ffffff;
            position: relative;
        }
        .photo-wrapper {
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            border: 1px solid #000000;
            height: 210px;
            background-color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .photo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .rec-badge {
            position: absolute;
            bottom: 6px;
            right: 6px;
            background-color: rgba(26, 18, 11, 0.9);
            color: #f59e0b;
            border: 1.2px solid #d97706;
            font-size: 8px;
            font-weight: 900;
            padding: 2.5px 6.5px;
            border-radius: 3.5px;
            font-family: monospace;
            z-index: 20;
            letter-spacing: 0.5px;
            line-height: 1;
        }
    </style>
</head>
<body>
    <div class="engineering-report-wrapper">
        <!-- Background Watermark Star -->
        <div class="watermark-absolute">
            <svg viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" /></svg>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border: none; background: transparent; position: relative; z-index: 10;">
            <thead>
                <tr>
                    <td style="border: none; padding: 0;">
                        <!-- HEADER BLOCK -->
                        <div class="header" style="width: 100%; padding-bottom: 5px;">
                            <div style="display: flex; align-items: center; justify-content: flex-start; gap: 15px;">
                                <svg viewBox="0 0 100 100" style="width: 58px; height: 58px; display: block; flex-shrink: 0;">
                                    <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" stroke="#000000" stroke-width="4.5" />
                                </svg>
                                <div style="display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                                    <div style="font-size: 20.5px; font-weight: bold; color: #000000; font-family: Arial, sans-serif; line-height: 1.1; margin: 0; white-space: nowrap; letter-spacing: -0.2px;">نجمة الوفاء لخدمات التنظيف والحراسة</div>
                                    <div style="display: flex; align-items: baseline; font-family: Arial, sans-serif; margin-top: 1px; white-space: nowrap;">
                                        <span style="font-size: 20.5px; font-weight: 950; color: #000000; font-family: Arial, sans-serif; font-weight: bold; letter-spacing: -0.5px; text-transform: uppercase;">AL WAFA STAR</span>
                                        <span style="font-size: 13.5px; font-weight: bold; color: #000000; margin-left: 6px;">Cleaning & Security Services</span>
                                    </div>
                                </div>
                            </div>
                            <!-- DOUBLE LINE UNDER HEADER GOES CORNER TO CORNER -->
                            <div style="margin-top: 12px; margin-bottom: 20px; text-align: left;">
                                <div style="height: 1.2px; background-color: #000000; width: 100%;"></div>
                                <div style="height: 2.8px; background-color: #ED1C24; width: 100%; margin-top: 2px;"></div>
                            </div>
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: none; padding: 0; vertical-align: top;">
                        <!-- REPORT ADMINISTRATIVE DETAILS -->
                        <div style="position: relative; z-index: 10; margin-top: 5px; font-family: Arial, sans-serif;">
                            <h2 style="font-size: 16px; font-weight: bold; color: #003366; text-decoration: underline; text-align: center; margin-bottom: 25px; font-family: Arial, sans-serif; letter-spacing: 0.1px;">${docTitle}</h2>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 25px; padding-left: 5px;">
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">FROM:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: uppercase;">${report.companyName || "AL WAFA STAR – PEST CONTROL"}</div>
                                </div>
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">PREPARED BY:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: uppercase;">ENGINEER ${report.engineerName ? report.engineerName.toUpperCase() : "AISHA"}</div>
                                </div>
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">To:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: uppercase;">${clientNameStr}</div>
                                </div>
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">STATE NAME:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: uppercase;">${report.emirate ? report.emirate.toUpperCase() : "DUBAI"}</div>
                                </div>
                                
                                <!-- Horizontal Line -->
                                <div style="border-top: 1.2px solid #000000; margin: 12px 0 8px 0;"></div>
                                
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">DATE OF VISIT:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000;">${report.date || "17/06/2026"}</div>
                                </div>
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">LOCATION:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: none; line-height: 1.4;">${report.visitLocation || "Hospital parameter outside – Surrounding building, garden areas"}</div>
                                </div>
                                <div style="display: flex; align-items: baseline;">
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; width: 160px; flex-shrink: 0; text-transform: uppercase;">TYPE OF VISIT:</div>
                                    <div style="font-size: 11.5px; font-weight: bold; color: #000000; text-transform: uppercase;">${amountLabel}</div>
                                </div>

                                <!-- Horizontal Line -->
                                <div style="border-top: 1.2px solid #000000; margin: 12px 0 8px 0;"></div>
                            </div>

                            <!-- 1. Purpose of inspection -->
                            ${report.includePurposeInOutput !== false ? `
                            <div style="margin-bottom: 25px; padding-left: 5px;">
                                <h3 style="font-size: 14px; font-weight: bold; color: #003366; font-family: Georgia, serif; font-style: italic; margin-bottom: 12px; margin-top: 5px;">1. Purpose of inspection:</h3>
                                <div style="margin-left: 15px;">
                                    <ul style="margin: 0; padding-left: 15px; font-size: 11px; line-height: 1.6; color: #000000; font-family: Arial, sans-serif;">
                                        ${purposeTextLines.map((line: string) => `
                                            <li style="margin-bottom: 8px;">${line.trim().replace(/^[•\-\*]\s*/, '')}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                            ` : ''}

                            <!-- 2. Inspection Findings -->
                            ${report.includeFindingsInOutput !== false ? `
                            <div style="margin-bottom: 25px; padding-left: 5px; page-break-inside: avoid; break-inside: avoid;">
                                <h3 style="font-size: 14px; font-weight: bold; color: #003366; font-family: Georgia, serif; font-style: italic; margin-bottom: 12px; margin-top: 5px;">2. Inspection Findings:</h3>
                                <div style="margin-left: 15px;">
                                    ${(report.workDetails || "").split('\n').filter((l: string) => l.trim()).map((line: string) => `
                                        <p style="font-size: 11px; color: #000000; font-weight: bold; margin: 3px 0; display: flex; align-items: flex-start; gap: 5px;"><span>•</span> <span>${line.trim()}</span></p>
                                    `).join('') || `<p style="font-size: 11.5px; color: #000000; font-weight: bold; margin: 3px 0;">• No outstanding findings recorded.</p>`}
                                </div>
                            </div>
                            ` : ''}

                            <!-- 3. Recommendations -->
                            ${report.includeRecommendationsInOutput !== false ? `
                            <div style="margin-bottom: 25px; padding-left: 5px; page-break-inside: avoid; break-inside: avoid;">
                                <h3 style="font-size: 14px; font-weight: bold; color: #003366; font-family: Georgia, serif; font-style: italic; margin-bottom: 12px; margin-top: 5px;">3. Recommendations:</h3>
                                <div style="margin-left: 15px;">
                                    ${(report.recommendationText || "").split('\n').filter((l: string) => l.trim()).map((line: string) => `
                                        <p style="font-size: 11px; color: #000000; font-weight: bold; margin: 3px 0; display: flex; align-items: flex-start; gap: 5px;"><span>•</span> <span>${line.trim()}</span></p>
                                    `).join('') || `<p style="font-size: 11.5px; color: #000000; font-weight: bold; margin: 3px 0;">• Maintain continuous housekeeping practices and close chemical vectors.</p>`}
                                </div>
                            </div>
                            ` : ''}

                            <!-- INSPECTION FIELD LOGS (If operationalLogs exists) -->
                            ${(report.includeOperationalLogInOutput !== false && report.operationalLogs) ? `
                            <div style="margin-bottom: 30px; padding-left: 5px; page-break-inside: avoid; break-inside: avoid;">
                                <h3 style="font-size: 13.5px; font-weight: bold; color: #003366; font-family: Georgia, serif; font-style: italic; margin-bottom: 12px; margin-top: 5px; margin-left: 5px;">Operational logs & treatment records:</h3>
                                <div style="margin-left: 15px; font-size: 11px; color: #000000; line-height: 1.6; font-family: Arial, sans-serif;">
                                    ${report.operationalLogs.split('\n').filter((l: string) => l.trim()).map((line: string) => `
                                        <p style="margin: 6px 0;">${line}</p>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- SECTION 5: IMAGES PAGES IF APPLICABLE -->
                            ${(allReportPhotos.length > 0 || recommendationPhotos.length > 0) ? `
                            <div style="page-break-before: always; break-before: page; padding-top: 20px;">
                                <h3 style="font-size: 14px; font-weight: bold; color: #003366; font-family: Georgia, serif; font-style: italic; margin-bottom: 15px; margin-top: 5px;">4. Recommended Action & Inspection Field Logs:</h3>
                                
                                <div class="photo-grid">
                                    ${allReportPhotos.map((photo) => {
                                        photoCount++;
                                        return `
                                        <div class="photo-card">
                                           <div class="photo-wrapper">
                                             <img src="${photo.url}" alt="${photo.caption || 'Inspection photo'}">
                                             <div class="rec-badge">REC ${photoCount}</div>
                                           </div>
                                           <div style="margin-top: 8px; font-size: 9.5px; font-weight: bold; color: #1e293b; text-transform: uppercase; font-family: Arial, sans-serif;">
                                             ${photo.caption || 'Observation view'}
                                           </div>
                                        </div>
                                        `;
                                    }).join("")}
                                    
                                    ${recommendationPhotos.map((photo) => {
                                        photoCount++;
                                        return `
                                        <div class="photo-card">
                                           <div class="photo-wrapper">
                                             <img src="${photo.url}" alt="${photo.caption || 'Reform photo'}">
                                             <div class="rec-badge">REC ${photoCount}</div>
                                           </div>
                                           <div style="margin-top: 8px; font-size: 9.5px; font-weight: bold; color: #1e293b; text-transform: uppercase; font-family: Arial, sans-serif;">
                                             ${photo.caption || 'Proposed reformation view'}
                                           </div>
                                        </div>
                                        `;
                                    }).join("")}
                                </div>
                            </div>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;

    return htmlContent;
};

export default function ClientDirectory({
  onSelectClientToPrefill,
  language,
  reports,
  onUpdateReports
}: ClientDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState<string>("ALL");
  const [showCopiedAlert, setShowCopiedAlert] = useState<string | null>(null);
  
  // Secondary local Tab Selector: Option 1 (Locations Map Cards), Option 2 (State Ledger Spreadsheet Excel)
  const [activeSubTab, setActiveSubTab] = useState<"cards" | "excel">("excel");
  
  // Custom report preview modal before downloading
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  // Multi-selection state for deleting ledger items in bulk
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleteSelectionMode, setIsDeleteSelectionMode] = useState(false);

  // Custom delete state to avoid iframe window.confirm blockages
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Custom facilities suggestions added dynamically by the user
  const [customFacilities, setCustomFacilities] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sync custom facilities with Firestore on load
  useEffect(() => {
    getStoreValue<Record<string, string[]>>("custom_emirate_facilities", {})
      .then((val) => {
        if (val && Object.keys(val).length > 0) {
          setCustomFacilities(val);
          localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(val));
        }
      })
      .catch((err) => console.log("Failed to sync custom facilities:", err));
  }, []);

  // Track which input row has its dropdown suggestions visible
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // States for the newly requested screen-centered full-screen selection popup modal
  const [activeModalReportId, setActiveModalReportId] = useState<string | null>(null);
  const [facilitySearchQuery, setFacilitySearchQuery] = useState<string>("");

  const saveCustomFacility = (emirate: string, facilityName: string) => {
    const normEmirate = (emirate || "ajman").toLowerCase().trim();
    const trimmedName = (facilityName || "").trim();
    if (!trimmedName) return;

    const currentList = customFacilities[normEmirate] || [];
    if (!currentList.includes(trimmedName)) {
      const nextList = [...currentList, trimmedName];
      const nextObj = { ...customFacilities, [normEmirate]: nextList };
      setCustomFacilities(nextObj);
      localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(nextObj));
      saveStoreValue("custom_emirate_facilities", nextObj)
        .catch((err) => console.log("Failed to sync new facility to Firestore:", err));
    }
  };

  const downloadFullReport = (report: ReportItem | any) => {
    const htmlContent = report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language);

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AlWafaStar-Report-${report.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFullReportPDF = async (report: ReportItem | any, customNameOverride?: string) => {
    try {
      const defaultName = `AlWafaStar-${report.facilityName ? report.facilityName.substring(0,20) : "Report"}-${report.ticketNo || report.id}`;
      let customFileName = customNameOverride || defaultName;

      if (!customFileName) return;

      const contentHtml = report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language);

      const isEngineering = !!report.rawEngineeringData;
      const layoutWidth = isEngineering ? 794 : 816;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(contentHtml);
        printWindow.document.close();
        printWindow.document.title = customFileName;

        printWindow.setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      } else {
        alert("Please allow pop-ups to print the PDF report.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create PDF view.");
    }
  };

  const handleBulkDownloadPDFs = async () => {
    if (selectedReportIds.length === 0) return;
    
    const confirmDownload = window.confirm(
      language === "bn" 
        ? `আপনি কি সত্যিই ${selectedReportIds.length}টি ফাইলের PDF ডাউনলোড করতে চান?`
        : `Are you sure you want to download PDFs for ${selectedReportIds.length} selected facility reports?`
    );
    if (!confirmDownload) return;

    for (let i = 0; i < selectedReportIds.length; i++) {
      const id = selectedReportIds[i];
      const report = activeExcelReports.find(r => r.id === id);
      if (report) {
        const defaultName = `AlWafaStar-${report.facilityName ? report.facilityName.substring(0,20) : "Report"}-${report.ticketNo || report.id}`;
        await downloadFullReportPDF(report, defaultName);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setSelectedReportIds([]);
    setIsDeleteSelectionMode(false);
  };

  const getFacilitiesForEmirate = (emirate: string): string[] => {
    const list = new Set<string>();
    const emLower = (emirate || "").toLowerCase().trim();

    // 1. Predefined map
    const mapped = EMIRATE_MAPPING_FACILITIES[emLower] || [];
    mapped.forEach(name => list.add(name));

    // 2. Custom user-saved facilities
    const userSaved = customFacilities[emLower] || [];
    userSaved.forEach(name => list.add(name));

    // Also look for matches by keyword in all standard facilities just in case
    STANDARD_FACILITIES.forEach(name => {
      const nameLower = name.toLowerCase();
      if (nameLower.includes(emLower)) {
        list.add(name);
      }
    });

    // 3. Client inputted values currently in database (reports) for this emirate
    reports.forEach(r => {
      if (r.emirate && r.emirate.toLowerCase().trim() === emLower && r.facilityName) {
        const trimmed = r.facilityName.trim();
        if (trimmed) {
          list.add(trimmed);
        }
      }
    });

    return Array.from(list);
  };

  const t = {
    en: {
      title: "Admin: System Operations Ledger",
      subtitle: "Configure compliance states, view branch facilities, and perform rapid inline edits on UAE operations",
      searchPlaceholder: "Search registered hospitals, clinics, contracts...",
      emirateFilter: "All Emirates Locations",
      autoFillBtn: "Auto-Fill Web Form",
      copied: "Linked successfully! Form Prefilled.",
      tabCards: "📍 Registered UAE Locations Cards",
      tabExcel: "📊 Dynamic Operation Ledger (Excel Style)"
    },
    bn: {
      title: "অ্যাডমিন পোর্টাল: সিস্টেম অপারেশনাল লেজার",
      subtitle: "মেডিকেল সাইট ফিল্টার ও সম্পন্ন কাজের ডাইরেক্ট আপডেট পোর্টাল",
      searchPlaceholder: "ক্লিনিক, হসপিটাল বা চুক্তি অনুসন্ধান করুন...",
      emirateFilter: "সকল আমিরাত স্টেট",
      autoFillBtn: "ফর্ম অটো-ফিল করুন",
      copied: "সফলভাবে ফর্মে সংযুক্ত করা হয়েছে!",
      tabCards: "📍 নিবন্ধিত মেডিকেল লোকেশন সমূহ",
      tabExcel: "📊 অপারেশনাল ডাইরেক্ট এক্সেল লেজার"
    },
    ar: {
      title: "بوابة المدير: دفتر العمليات والتعقيم المعتمد",
      subtitle: "معالجة وتحديث لوحة العمليات وحالة التعقيم للمراكز الطبية دولة الإمارات",
      searchPlaceholder: "ابحث عن مستشفى، عيادة، عقد...",
      emirateFilter: "جميع الإمارات",
      autoFillBtn: "تعبئة تلقائية للنموذج",
      copied: "تم الربط والمزامنة تلقائياً بنجاح!",
      tabCards: "📍 بطاقات فروع المواقع الطبية",
      tabExcel: "📊 دفتر معالجة العمليات والبيانات المباشر"
    }
  }[language];

  // Primary Predefined locations list
  const locations = [
    // AJMAN
    { name: "Al Hamidiyah Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Amna Al Shamsi", email: "hamidiyah.hc@moh.gov.ae", contract: "CON-4820-A", id: "ALW-CLI-3901" },
    { name: "Public Health Center", emirate: "Ajman", type: "Health Center", contact: "Mrs. Fatima Al Hammadi", email: "ajman.phc@moh.gov.ae", contract: "CON-4820-B", id: "ALW-CLI-3902" },
    { name: "Dental Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Salem Obaid", email: "ajman.dhc@moh.gov.ae", contract: "CON-9301-C", id: "ALW-CLI-3903" },
    { name: "Mushairif Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Khaled Al Nuaimi", email: "mushairif.hc@moh.gov.ae", contract: "CON-4021-X", id: "ALW-CLI-3904" },
    { name: "Maple Clinic", emirate: "Ajman", type: "Clinic", contact: "Dr. John Mathews", email: "info@mapleclinic.ae", contract: "CON-8821-M", id: "ALW-CLI-3905" },
    { name: "Ajman Medical Store", emirate: "Ajman", type: "Warehouse", contact: "Mr. Shafiqa Jaber", email: "ajman.store@medical.ae", contract: "CON-7432-Y", id: "ALW-CLI-3906" },
    { name: "Ajman DTC", emirate: "Ajman", type: "Health Center", contact: "Dr. Maryam Al Ali", email: "dtc.ajman@moh.gov.ae", contract: "CON-3392-L", id: "ALW-CLI-3907" },
    { name: "Al Rashidiya Clinic", emirate: "Ajman", type: "Clinic", contact: "Dr. Sara Al Mazrouei", email: "rashidiya.clinic@moh.gov.ae", contract: "CON-2849-Z", id: "ALW-CLI-3908" },

    // DUBAI
    { name: "Al Kuwait Hospital", emirate: "Dubai", type: "Hospital", contact: "Eng. Sayed Abdul Rahman", email: "s.rahman@kuwaithospital.ae", contract: "CON-9921-X", id: "ALW-CLI-4028" },
    { name: "Hor Al Anz Health Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Mona Al Falasi", email: "horalanz.hc@dha.gov.ae", contract: "CON-1903-P", id: "ALW-CLI-4029" },
    { name: "Smart Salem Medical Fitness Centre", emirate: "Dubai", type: "Medical Center", contact: "Mr. Saeed Al Falasi", email: "info@smartsalem-fitness.ae", contract: "CON-3801-S", id: "ALW-CLI-4030" },
    { name: "DTC Rashidiya", emirate: "Dubai", type: "Health Center", contact: "Dr. Humaid Al Qutami", email: "dtc.rashidiya@dha.gov.ae", contract: "CON-9891-B", id: "ALW-CLI-4031" },
    { name: "ENOC Salem", emirate: "Dubai", type: "Medical Center", contact: "Mr. Salim Al Gurg", email: "enoc.salem@salem.ae", contract: "CON-1830-W", id: "ALW-CLI-4032" },
    { name: "Erada Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Hamad Al Ghaferi", email: "erada.rehab@erada.ae", contract: "CON-8472-F", id: "ALW-CLI-4033" },
    { name: "Silicon Oasis Health Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Aisha Bin Bishr", email: "silicon.oasis@dha.gov.ae", contract: "CON-4201-E", id: "ALW-CLI-4034" },

    // SHARJAH
    { name: "Al Kuwait Hospital", emirate: "Sharjah", type: "Hospital", contact: "Dr. Afra Al Suwaidi", email: "shj.kuwait@moh.gov.ae", contract: "CON-1122-A", id: "ALW-CLI-5001" },
    { name: "Family Health Promotion Center", emirate: "Sharjah", type: "Health Center", contact: "Mrs. Noura Al Nooman", email: "familyhealth.shj@moh.gov.ae", contract: "CON-3281-B", id: "ALW-CLI-5002" },
    { name: "Blood Transfusion Center", emirate: "Sharjah", type: "Laboratory", contact: "Dr. Amin Al Amiri", email: "sharjah.bloodbank@moh.gov.ae", contract: "CON-7431-L", id: "ALW-CLI-5003" },
    { name: "Khorfakkan Hospital", emirate: "Sharjah", type: "Hospital", contact: "Mr. Obaid Al Khalfan", email: "khorfakkan.hp@moh.gov.ae", contract: "CON-8422-C", id: "ALW-CLI-5004" },
    { name: "Malaria Unit", emirate: "Sharjah", type: "Health Center", contact: "Mr. Tariq Al Kaabi", email: "malaria.shj@moh.gov.ae", contract: "CON-9302-M", id: "ALW-CLI-5005" },

    // UMM AL QUWAIN
    { name: "Umm Al Quwain Hospital", emirate: "Umm Al Quwain", type: "Hospital", contact: "Dr. Maitha Al Shali", email: "uaq.hospital@moh.gov.ae", contract: "CON-5011-H", id: "ALW-CLI-6001" },
    { name: "Al Khazan Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Mrs. Maryam Al Ali", email: "khazan.hc@moh.gov.ae", contract: "CON-3394-K", id: "ALW-CLI-6002" },
    { name: "Falaj Al Mualla Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Dr. Saif Al Bedwawi", email: "falaj.hc@moh.gov.ae", contract: "CON-4822-F", id: "ALW-CLI-6003" },
    { name: "Al Rafa Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Dr. Fatima Al Nuaimi", email: "rafa.hc@moh.gov.ae", contract: "CON-5582-R", id: "ALW-CLI-6004" }
  ];

  const emirates = ["ALL", "Ajman", "Dubai", "Sharjah", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

  // Search filter for option 1 Locations Cards
  const filteredLocs = locations.filter((loc) => {
    const matchesSearch = 
      (loc.name || "").toLowerCase().includes((search || "").toLowerCase()) || 
      (loc.contact || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (loc.id || "").toLowerCase().includes((search || "").toLowerCase());
    const matchesEmirate = 
      selectedEmirate === "ALL" || (loc.emirate || "").toLowerCase() === (selectedEmirate || "").toLowerCase();
    return matchesSearch && matchesEmirate;
  });

  const handleApplyPrefill = (loc: any) => {
    onSelectClientToPrefill(loc);
    setShowCopiedAlert(loc.id);
    setTimeout(() => {
      setShowCopiedAlert(null);
    }, 2500);
  };

  // Excel Cell Change handler
  const handleExcelCellChange = (reportId: string, field: string, value: any) => {
    if (!onUpdateReports) return;
    const updated = reports.map(r => {
      if (r.id === reportId) {
        if (field === "dateOfOperation") {
          let nextDueDate = r.endDate;
          try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              d.setDate(d.getDate() + 30);
              nextDueDate = d.toISOString().split("T")[0];
            }
          } catch(e) {}
          return { ...r, dateOfOperation: value, endDate: nextDueDate };
        }
        if (field === "billingAmount") {
          return {
            ...r,
            billing: {
              ...r.billing,
              amount: value
            }
          };
        }
        return {
          ...r,
          [field]: value
        };
      }
      return r;
    });
    onUpdateReports(updated);
  };

  // Excel delete Row using custom safe modal state instead of default blocked confirm dialogs
  const handleExcelDeleteRow = (reportId: string) => {
    setDeleteId(reportId);
  };

  // Excel Add Row (Appended to Very Bottom!)
  const handleExcelAddRow = (emirateName: string) => {
    const newId = `ALW-CLI-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const newReport: ReportItem = {
      id: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
      facilityName: "",
      clientId: newId,
      contractNo: `CON-${Math.floor(10000 + Math.random() * 90000)}`,
      branchName: "Main Branch",
      facilityType: "Clinic",
      emirate: emirateName || "Dubai",
      address: `${emirateName} Health Sector, UAE`,
      contactPerson: "Dr. Ahmed Hamdy",
      mobile: "050-XXXXXXX",
      whatsapp: "050-XXXXXXX",
      email: "clinic@alwafastar.ae",
      startDate: todayStr,
      endDate: nextMonthStr,
      validity: "1 Year",
      dateOfOperation: todayStr,
      ticketNo: `TKT-${Math.floor(10000 + Math.random() * 90000)}-AL`,
      startTime: "09:00",
      endTime: "10:30",
      duration: "1h 30m",
      categories: ["Pest Control", "Disinfection"],
      areas: ["Internal Lobby", "Sanitation Zone"],
      reportText: "Automated service report logged on spreadsheet level.",
      workStatus: "Completed",
      methods: ["Spraying"],
      chemicals: [
        { name: "Deltacide SC", dilution: "1:100", used: "200 ml", batch: "DT-0294", expiry: "2027-02-18", remaining: "4.8 L" }
      ],
      infestation: { Cockroaches: "Low" },
      sanitation: "Satisfactory",
      proofing: "Satisfactory",
      recommendations: ["Ensure doors remain tightly closed after operations"],
      billing: {
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: todayStr,
        amount: "", // Initialized as Blank
        discount: 0,
        vat: 0,
        total: 0,
        method: "Bank Transfer",
        status: "Paid"
      },
      technicians: ["Hamdy", "Hussin"],
      signatures: {}
    };
    
    // Append to bottom as requested: "যেটা নতুন করব সেটা সবচেয়ে নিচে চলে যাবে"
    onUpdateReports([...reports, newReport]);
  };

  const isRunningMonth = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    try {
      const trimmed = dateStr.trim();
      const matchYMD = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
      const now = new Date();
      if (matchYMD) {
        const year = parseInt(matchYMD[1], 10);
        const month = parseInt(matchYMD[2], 10) - 1; // 0-indexed
        return year === now.getFullYear() && month === now.getMonth();
      }
      const matchDMY = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (matchDMY) {
        const year = parseInt(matchDMY[3], 10);
        const month = parseInt(matchDMY[2], 10) - 1; // 0-indexed
        return year === now.getFullYear() && month === now.getMonth();
      }
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime())) return false;
      return parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth();
    } catch (e) {
      return false;
    }
  };

  // Engineering Reports loading
  const [engineeringReports, setEngineeringReports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ALW_ENGINEERING_REPORTS");
      if (raw) {
        setEngineeringReports(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

  // Map engineering reports to standard format
  const mappedEngineeringReports = engineeringReports.map(eng => ({
    id: eng.id,
    facilityName: eng.clientName,
    clientId: eng.reportNo,
    contractNo: eng.reportNo,
    branchName: "Main",
    facilityType: "Engineering Report", 
    emirate: eng.emirate || "Dubai",
    address: "",
    contactPerson: eng.engineerName || "",
    mobile: "",
    whatsapp: "",
    email: "",
    startDate: eng.date,
    endDate: "",
    validity: "N/A",
    dateOfOperation: eng.date,
    ticketNo: eng.reportNo,
    reportText: "Engineering Report",
    workStatus: "Completed",
    rawEngineeringData: eng
  } as any));

  // Filter completed or active operational reports for Excel ledger
  const activeExcelReports = [...reports, ...mappedEngineeringReports].filter((r) => {
    // Show only completed service reports as requested
    const isServiceReport = r.workStatus === "Completed" || !r.workStatus;
    if (!isServiceReport) return false;

    // Note: If a row is added directly from the spreadsheet, it should always be visible so adding/editing is seamless.
    const isManuallyAddedInExcel = r.reportText === "Automated service report logged on spreadsheet level.";

    const matchesSearch = 
      (r.facilityName || "").toLowerCase().includes(search.toLowerCase()) || 
      (r.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.clientId || "").toLowerCase().includes(search.toLowerCase());
    const matchesEmirate = 
      selectedEmirate === "ALL" || (r.emirate || "").toLowerCase() === selectedEmirate.toLowerCase();
    return matchesSearch && matchesEmirate;
  });

  return (
    <div id="admin-location-ledger-view" className="space-y-6 pb-12">
      
      {/* Top Banner and Tabs Card */}
      <div className="bg-[#1E293B]/60 border border-[#334155] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="text-[#10B981] w-5.5 h-5.5" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Sub-tab Switcher: Option 1 vs Option 2 */}
          <div className="flex bg-slate-900 border border-slate-700/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSubTab("excel")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "excel"
                  ? "bg-[#10B981] text-slate-950 shadow-md shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.tabExcel}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("cards")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "cards"
                  ? "bg-[#2563EB] text-slate-50 shadow-md shadow-blue-500/10"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.tabCards}</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              id="ledger-search-box"
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
            />
          </div>

          <div>
            <select
              id="ledger-emirate-dropdown"
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-[#10B981] outline-none cursor-pointer"
            >
              {emirates.map((em) => (
                <option key={em} value={em}>
                  {em === "ALL" ? t.emirateFilter : em.toUpperCase() + " STATE"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RENDER VIEW TAB 1: REGISTERED CARDS */}
      {activeSubTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredLocs.map((loc) => {
            const isCopied = showCopiedAlert === loc.id;
            return (
              <div 
                id={`loc-card-${loc.id}`}
                key={loc.id} 
                className="bg-slate-900 border border-slate-800 hover:border-[#10B981]/50 p-5 rounded-2xl shadow-md space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-emerald-500/10 text-[#10B981] font-mono font-bold uppercase rounded px-2.5 py-1 tracking-wider border border-[#10B981]/20">
                      {loc.emirate}
                    </span>
                    <span className="text-xs font-mono text-slate-500 text-right">
                      {loc.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight">
                      {loc.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {loc.type} | Contract No: {loc.contract}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                    <p className="text-xs flex items-center gap-1.5 leading-snug">
                      <span className="font-semibold text-slate-500 shrink-0">Supervisor:</span> 
                      <span className="truncate">{loc.contact}</span>
                    </p>
                    <p className="text-xs flex items-center gap-1.5 leading-snug">
                      <span className="font-semibold text-slate-500 shrink-0">Email:</span> 
                      <span className="text-[11px] font-mono text-emerald-400 truncate">{loc.email}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    id={`link-btn-${loc.id}`}
                    onClick={() => handleApplyPrefill(loc)}
                    className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isCopied 
                        ? "bg-slate-950 text-[#10B981] border border-[#10B981]" 
                        : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-4 h-4" />
                        <span>{t.autoFillBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER VIEW TAB 2: EXCEL LEDGER Direct spreadsheet */}
      {activeSubTab === "excel" && (
        <div className="space-y-6 animate-fade-in font-sans text-xs">
          
          {/* Quick instructions widget */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 font-medium">
            <div className="space-y-1">
              <p className="text-[#10B981] font-bold flex items-center gap-1.5">
                <span>⚡</span>
                <span>{language === "bn" ? "এক্সেল ডাইরেক্ট অপারেশনাল লেজার সক্রিয়" : "Dynamic Operations Ledger Spreadsheet Active"}</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {language === "bn" 
                  ? "১. হসপিটাল/ক্লিনিক নামের ঘরে ক্লিক করলে সাজেশন্স পাবেন, ইচ্ছামত টাইপও করতে পারবেন। ২. কাজ করার তারিখ বদল করলে পরবর্তী মেয়াদ ৩০ দিন স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে। ৩. টাকার ঘরের ৩টি অপশন: ব্লাঙ্ক (ফাঁকা), No (ফ্রি), এবং কাস্টম পেইড (সবুজ রং)। ৪. প্রতিটি আমিরাত স্টেটের সিরিয়াল নং আলাদাভাবে হিসাব করা হয়।"
                  : "1. Click inside Facility Name to select from suggestions or custom type. 2. Modifying operations date auto-shifts due expiry by 30 days. 3. Three cash options: Blank, No Charge (No), or Custom Paid Cash (Emerald Green)."}
              </p>
            </div>
             <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isDeleteSelectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteSelectionMode(false);
                      setSelectedReportIds([]);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white font-bold rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    ✕ {language === "bn" ? "মোড বাতিল" : "Cancel"}
                  </button>

                  <button
                    type="button"
                    disabled={selectedReportIds.length === 0}
                    onClick={handleBulkDownloadPDFs}
                    className={`px-4 py-2.5 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg ${
                      selectedReportIds.length > 0 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer border border-emerald-500" 
                        : "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800"
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {language === "bn" 
                        ? (selectedReportIds.length > 0 ? `নির্বাচিত ${selectedReportIds.length}টি PDF ডাউনলোড` : "সিলেক্ট করুন") 
                        : (selectedReportIds.length > 0 ? `Download PDF (${selectedReportIds.length})` : "Download Selected")}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedReportIds.length === 0}
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className={`px-4 py-2.5 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg ${
                      selectedReportIds.length > 0 
                        ? "bg-rose-650 hover:bg-red-500 text-white shadow-rose-600/30 cursor-pointer border border-rose-500" 
                        : "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === "bn" 
                        ? (selectedReportIds.length > 0 ? `নির্বাচিত ${selectedReportIds.length}টি মুছুন` : "সিলেক্ট করুন") 
                        : (selectedReportIds.length > 0 ? `Delete Selected (${selectedReportIds.length})` : "Delete Selected")}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteSelectionMode(true);
                    setSelectedReportIds([]);
                  }}
                  className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-350 font-black rounded-xl border border-indigo-500/25 transition flex items-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-indigo-600/5 hover:scale-[1.01]"
                  title={language === "bn" ? "একাধিক রো সিলেক্ট করে ডিলিট বা ডাউনলোড করুন" : "Enable selection mode to delete or download multiple rows"}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-550" />
                  <span>
                    {language === "bn" ? "⚙️ একাধিক সিলেক্ট করুন" : "⚙️ Select Multiple"}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => {
                  const defaultEmirateName = selectedEmirate === "ALL" ? "Dubai" : selectedEmirate;
                  handleExcelAddRow(defaultEmirateName);
                }}
                className="px-4 py-2.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20 text-xs"
              >
                ➕ {language === "bn" ? "নতুন রো যোগ করুন" : "Add Facility Row"}
              </button>
            </div>
          </div>

          {/* DYNAMIC MULTI-SELECT ACTIVE DELETION BANNER */}
          {isDeleteSelectionMode && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/25 rounded-2xl text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-505 animate-pulse shrink-0 block"></span>
                <span className="font-semibold text-[11px]">
                  {language === "bn" 
                    ? "🗑️ ডিলিট কন্ট্রোল সক্রিয়: একাধিক সারি একসাথে ডিলিট করার জন্য নিচে বাম পাশের টিক-বক্সে (✔) চাপ দিন।" 
                    : "🗑️ Deletion Panel Active: Tick the selecting boxes (✔) on the left of each row to delete multiple entries."}
                </span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-[10px] bg-rose-650/45 text-rose-200 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold font-mono">
                  {language === "bn" ? `নির্বাচিত: ${selectedReportIds.length} টি` : `Selected: ${selectedReportIds.length}`}
                </span>
              </div>
            </div>
          )}

          {/* Grouped state Tables to maintain individual state serials */}
          {["Ajman", "Dubai", "Sharjah", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Al Dhaid"]
            .filter((state) => selectedEmirate === "ALL" || selectedEmirate.toLowerCase() === state.toLowerCase())
            .map((emirateState) => {
              const stateReports = activeExcelReports.filter((r) => (r.emirate || "").toLowerCase() === emirateState.toLowerCase());
              if (stateReports.length === 0) return null;

              return (
                <div key={emirateState} className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <h3 className="text-xs font-black text-emerald-400 tracking-wide flex items-center gap-1.5 uppercase">
                      <span className="text-xs">📍</span>
                      <span>{emirateState} Operational Ledger</span>
                      <span className="text-[9px] bg-slate-800 text-[#10B981] font-mono border border-[#10B981]/25 py-0.5 px-2 rounded-full">
                        {stateReports.length} {stateReports.length === 1 ? "Line Item" : "Line Items"}
                      </span>
                    </h3>
                    <button
                      onClick={() => handleExcelAddRow(emirateState)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                    >
                      ➕ Add Entry ({emirateState})
                    </button>
                  </div>

                  {/* Spreadsheet Grid container */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-slate-200 text-left border-collapse table-auto text-[9.5px] font-medium min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-mono text-[8px] uppercase tracking-wider border-b border-slate-800">
                           {isDeleteSelectionMode && (
                             <th className="py-2 px-1 border-r border-slate-800 w-[30px] text-center">
                               <input
                                 type="checkbox"
                                 checked={stateReports.length > 0 && stateReports.every(r => selectedReportIds.includes(r.id))}
                                 onChange={(e) => {
                                   const checked = e.target.checked;
                                   if (checked) {
                                     const newSelections = Array.from(new Set([...selectedReportIds, ...stateReports.map(r => r.id)]));
                                     setSelectedReportIds(newSelections);
                                   } else {
                                     const newSelections = selectedReportIds.filter(id => !stateReports.some(r => r.id === id));
                                     setSelectedReportIds(newSelections);
                                   }
                                 }}
                                 className="rounded cursor-pointer accent-[#10B981]"
                               />
                             </th>
                           )}
                           <th className="py-2 px-1 border-r border-slate-800 w-[26px] text-center">(#)</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[124px]">{language === "bn" ? "ক্লিনিক নাম" : "Clinic Name"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[76px]">{language === "bn" ? "কাজের অবস্থা" : "Status"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[92px]">{language === "bn" ? "কাজের তারিখ" : "Work Date"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[92px]">{language === "bn" ? "পরবর্তী মেয়াদ" : "Next Due (30d)"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[76px]">{language === "bn" ? "বাকি দিন" : "Days Left"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[82px]">{language === "bn" ? "বিলিং" : "Billing"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[84px] text-center">{language === "bn" ? "ডাউনলোড" : "Download"}</th>
                           <th className="py-2 px-1 text-center w-[50px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {stateReports.map((report, idx) => {
                          const isReadonly = report.workStatus === "Completed" && report.reportText !== "Automated service report logged on spreadsheet level.";
                          
                          const amountValue = report.billing?.amount ?? "";
                          let pricingOption = "blank";
                          if (amountValue === "No" || amountValue === "no") {
                            pricingOption = "no";
                          } else if (amountValue !== "" && !isNaN(Number(amountValue))) {
                            pricingOption = "paid";
                          }

                          return (
                            <tr key={`${report.id}-${idx}`} className="hover:bg-slate-800/40 bg-slate-950/20 transition">
                              
                              {/* Selection checkbox */}
                              {isDeleteSelectionMode && (
                                <td className="py-1 px-1 border-r border-slate-800 text-center w-[30px] bg-slate-950/20">
                                  <input
                                    type="checkbox"
                                    checked={selectedReportIds.includes(report.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      if (checked) {
                                        setSelectedReportIds([...selectedReportIds, report.id]);
                                      } else {
                                        setSelectedReportIds(selectedReportIds.filter(id => id !== report.id));
                                      }
                                    }}
                                    className="rounded cursor-pointer accent-[#10B981]"
                                  />
                                </td>
                              )}

                              {/* Serial count localized per state starting at 1 */}
                              <td className="py-1 px-1 border-r border-slate-800 text-center font-bold text-slate-500 bg-slate-950/40 w-[26px] font-mono">
                                {idx + 1}
                              </td>

                              {/* Autocomplete Input Column utilizing the screen-centered selector Modal */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[124px] font-sans">
                                <button
                                  type="button"
                                  disabled={isReadonly}
                                  onClick={() => {
                                    if (isReadonly) return;
                                    setActiveModalReportId(report.id);
                                    setFacilitySearchQuery("");
                                  }}
                                  className={`w-full text-left bg-slate-900 border text-slate-300 font-bold rounded px-1 py-0.5 outline-none transition text-[9.5px] flex justify-between items-center gap-0.5 ${isReadonly ? "opacity-60 cursor-not-allowed border-transparent" : "hover:bg-slate-850 border-[#334155]/60 hover:border-[#10B981]/50 cursor-pointer group"}`}
                                  title={language === "bn" ? "ক্লিনিক বা হসপিটাল নাম নির্বাচন করতে ক্লিক করুন" : "Click to select clinic"}
                                >
                                  <span className={`truncate flex-1 ${report.facilityName ? "text-[#10B981] font-black" : "text-slate-400 font-bold"}`}>
                                    {report.facilityName || (language === "bn" ? "সিলেক্ট..." : "Select...")}
                                  </span>
                                  <span className={`text-[7.5px] shrink-0 transition-colors ${isReadonly ? "text-slate-600" : "text-slate-400 group-hover:text-[#10B981]"}`}>
                                    {isReadonly ? "🔒" : "▼"}
                                  </span>
                                </button>
                              </td>

                              {/* Sector Clinic Type Selection */}
                              <td className="py-1 px-0.5 border-r border-slate-800 w-[76px]">
                                <select
                                  disabled={isReadonly}
                                  value={report.facilityType}
                                  onChange={(e) => handleExcelCellChange(report.id, "facilityType", e.target.value)}
                                  className={`bg-slate-900 text-slate-300 border border-[#334155]/60 px-1 py-0.5 text-[9.5px] font-bold w-full rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer focus:border-blue-500"}`}
                                >
                                  {(() => {
                                    const currentVal = report.facilityType || "Incomplete";
                                    const isStandard = ["Completed", "Partially Completed", "Incomplete"].includes(currentVal);
                                    const options = [
                                      { value: "Completed", label: language === "bn" ? "কমপ্লিট" : "Completed" },
                                      { value: "Partially Completed", label: language === "bn" ? "অর্ধেক করা হয়েছে" : "Partially Completed" },
                                      { value: "Incomplete", label: language === "bn" ? "কমপ্লিট হয়নি" : "Incomplete" }
                                    ];
                                    if (!isStandard && currentVal) {
                                      options.push({ value: currentVal, label: currentVal });
                                    }
                                    return options.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ));
                                  })()}
                                </select>
                              </td>

                              {/* Operational Date Input */}
                              <td className="py-1 px-0.5 border-r border-[#1E293B] w-[92px]">
                                <input
                                  type="date"
                                  disabled={isReadonly}
                                  value={report.dateOfOperation}
                                  onChange={(e) => handleExcelCellChange(report.id, "dateOfOperation", e.target.value)}
                                  className={`w-full bg-slate-900 border border-slate-800 text-slate-100 px-1 py-0.5 text-[9px] font-mono font-bold rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "focus:border-blue-500 cursor-pointer"}`}
                                />
                              </td>

                              {/* Automatic Expiry date extension (+30 Days) */}
                              <td className="py-1 px-0.5 border-r border-[#1E293B] w-[92px]">
                                <input
                                  type="date"
                                  disabled={isReadonly}
                                  value={report.endDate}
                                  onChange={(e) => handleExcelCellChange(report.id, "endDate", e.target.value)}
                                  className={`w-full bg-slate-900 border border-slate-800 text-emerald-400 px-1 py-0.5 text-[9px] font-mono font-bold rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "focus:border-blue-500 cursor-pointer"}`}
                                />
                              </td>

                              {/* Days Remaining Live Countdown */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[76px] text-center font-mono font-bold">
                                {(() => {
                                  if (!report.endDate) return <span className="text-slate-500">—</span>;
                                  
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const due = new Date(report.endDate);
                                  due.setHours(0, 0, 0, 0);
                                  
                                  const diffTime = due.getTime() - today.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  
                                  if (isNaN(diffDays)) {
                                    return <span className="text-slate-500">—</span>;
                                  }

                                  if (diffDays < 0) {
                                    return (
                                      <span className="text-[8.5px] text-red-400 bg-red-400/10 px-0.5 py-0.5 rounded border border-red-500/20 block truncate max-w-full" title="Overdue">
                                        {language === "bn" ? `${Math.abs(diffDays)} দিন পার` : `${Math.abs(diffDays)}d Over`}
                                      </span>
                                    );
                                  } else if (diffDays === 0) {
                                    return (
                                      <span className="text-[8.5px] text-amber-405 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/25 block truncate max-w-full font-sans">
                                        {language === "bn" ? "আজ শেষ" : "Today"}
                                      </span>
                                    );
                                  } else if (diffDays <= 5) {
                                    return (
                                      <span className="text-[9px] text-rose-300 bg-rose-500/10 px-0.5 py-0.5 rounded border border-rose-500/20 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  } else if (diffDays <= 15) {
                                    return (
                                      <span className="text-[9px] text-amber-300 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/20 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-0.5 py-0.5 rounded border border-emerald-500/25 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  }
                                })()}
                              </td>

                              {/* Billing Status with 3 choices & colors - COMPACTED in width */}
                              <td className="py-1 px-1 border-r border-[#1E293B] w-[82px]">
                                <div className="flex items-center gap-0.5 w-full justify-between">
                                  <select
                                    disabled={isReadonly}
                                    value={pricingOption}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "blank") {
                                        handleExcelCellChange(report.id, "billingAmount", "");
                                      } else if (val === "no") {
                                        handleExcelCellChange(report.id, "billingAmount", "No");
                                      } else {
                                        handleExcelCellChange(report.id, "billingAmount", 1200);
                                      }
                                    }}
                                    className={`bg-slate-900 border border-slate-800 text-slate-200 rounded px-0.5 py-0.5 text-[8px] font-bold outline-none shrink-0 w-[42px] ${isReadonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <option value="blank">{language === "bn" ? "খালি" : "Blank"}</option>
                                    <option value="no">{language === "bn" ? "ফ্রি" : "Free"}</option>
                                    <option value="paid">{language === "bn" ? "পেইড" : "Paid"}</option>
                                  </select>

                                  {pricingOption === "paid" && (
                                    <div className={`flex items-center bg-slate-950 border border-emerald-500/30 rounded px-0.5 py-0.5 shrink-0 w-[38px] ${isReadonly ? "opacity-60" : ""}`}>
                                      <input
                                        type="number"
                                        disabled={isReadonly}
                                        value={isNaN(Number(report.billing?.amount)) ? "" : report.billing.amount}
                                        onChange={(e) => {
                                          const entered = e.target.value === "" ? "" : Number(e.target.value);
                                          handleExcelCellChange(report.id, "billingAmount", entered);
                                        }}
                                        className={`w-full bg-transparent border-none text-[9.5px] font-mono font-extrabold text-[#10B981] text-right outline-none p-0 ${isReadonly ? "cursor-not-allowed" : ""}`}
                                        placeholder="0"
                                      />
                                    </div>
                                  )}

                                  {pricingOption === "no" && (
                                    <span className="text-[8px] font-black text-amber-550 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/20 shrink-0 select-none">
                                      {language === "bn" ? "ফ্রি" : "FREE"}
                                    </span>
                                  )}

                                  {pricingOption === "blank" && (
                                    <span className="text-[9px] text-slate-500 italic font-mono px-0.5 shrink-0 select-none">
                                      —
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Download Form Button */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[84px] text-center">
                                <button
                                  type="button"
                                  onClick={() => setPreviewReport(report)}
                                  className="mx-auto px-1.5 py-0.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black rounded transition-all duration-75 flex items-center justify-center gap-1 cursor-pointer text-[9px] active:scale-95 shadow-sm"
                                  title={language === "bn" ? "ডاونلوډ করার পূর্বে ফর্মটি চেক করুন" : "Preview form before downloading"}
                                >
                                  <Download className="w-2.5 h-2.5 shrink-0" />
                                  <span>{language === "bn" ? "ডাউনলোড" : "Download"}</span>
                                </button>
                              </td>

                              {/* Table row actions */}
                              <td className="py-1 px-1 w-[50px] text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setPreviewReport(report)}
                                    className="p-1 text-blue-400 hover:text-blue-350 hover:bg-blue-500/15 bg-slate-900 border border-slate-800/85 rounded transition flex items-center justify-center cursor-pointer"
                                    title={language === "bn" ? "বিস্তারিত দেখুন" : "View Details"}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleExcelDeleteRow(report.id)}
                                    className="p-1 text-red-400 hover:text-red-350 hover:bg-red-500/15 bg-slate-900 border border-slate-800/85 rounded transition flex items-center justify-center cursor-pointer"
                                    title={language === "bn" ? "মুছে ফেলুন" : "Delete"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
        </div>
      )}


      {/* CUSTOM RECONCILED CONFIRMATION DELETE DIALOG */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-red-550/30 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  {language === "bn" ? "তথ্য মুছে ফেলা নিশ্চিত করুন" : "Confirm Data Deletion"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn" ? "আপনি কি এই অপারেশনাল লাইন আইটেমটি মুছে ফেলতে চান?" : "Are you sure you want to delete this operational ledger entry?"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">Ledger Row Reference</span>
              <span className="text-slate-200 font-bold block mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap">
                {reports.find(r => r.id === deleteId)?.facilityName || "Selected Facility"}
              </span>
              <span className="text-slate-500 font-mono text-[10px] block mt-0.5">
                ID: {deleteId}
              </span>
            </div>

            <p className="text-xs text-red-400 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {language === "bn" 
                ? "সতর্কতা: এই পদক্ষেপটি অপূরণীয়। ডিলিট করার পর ডাটাবেজ এবং ক্লায়েন্ট হিস্ট্রি থেকে এটি চিরতরে হারিয়ে যাবে।" 
                : "Warning: This action cannot be undone. Once deleted, this entry will be permanently removed from database and client histories."}
            </p>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteSelectionMode(true);
                  if (deleteId) {
                    setSelectedReportIds([deleteId]);
                  }
                  setDeleteId(null);
                }}
                className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title={language === "bn" ? "একাধিক তথ্য একসাথে ডিলিট করুন" : "Enable selection to delete multiple items"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "একাধিক ডিলিট" : "Multi-Delete"}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === "bn" ? "বাতিল করুন" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const isEngReport = engineeringReports.find(eng => eng.id === deleteId);
                    if (isEngReport) {
                      const newEng = engineeringReports.filter(eng => eng.id !== deleteId);
                      setEngineeringReports(newEng);
                      localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(newEng));
                      deleteDocument("engineeringReports", deleteId as string);
                    } else {
                      onUpdateReports(reports.filter(r => r.id !== deleteId));
                      deleteDocument("serviceReports", deleteId as string);
                    }
                    setSelectedReportIds(selectedReportIds.filter(id => id !== deleteId));
                    setDeleteId(null);
                  }}
                  className="px-5 py-2 bg-[#EF4444] hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-red-500/15"
                >
                  {language === "bn" ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RECONCILED CONFIRMATION BULK DELETE DIALOG */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-550">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  {language === "bn" ? "একসঙ্গে একাধিক তথ্য ডিলিট নিশ্চিতকরণ" : "Confirm Bulk Deletion"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn" 
                    ? `আপনি কি নিশ্চিত যে নির্বাচিত ${selectedReportIds.length}টি অপারেশনাল রেকর্ড ডিলিট করতে চান?` 
                    : `Are you sure you want to delete the ${selectedReportIds.length} selected operational ledger entries?`}
                </p>
              </div>
            </div>

            <div className="max-h-32 overflow-y-auto bg-slate-950 rounded-xl border border-slate-850 p-3 divide-y divide-slate-800 text-xs text-slate-300">
              {activeExcelReports
                .filter(r => selectedReportIds.includes(r.id))
                .map((r, idx) => (
                  <div key={`${r.id}-${idx}`} className="py-1.5 flex justify-between items-center text-slate-350 font-sans">
                    <span className="font-bold truncate max-w-[220px] text-emerald-400">{r.facilityName || (language === "bn" ? "[নামহীন]" : "[Unnamed]")}</span>
                    <span className="font-mono text-[9px] text-slate-500 uppercase shrink-0">{r.emirate} ({r.id})</span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-rose-450 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {language === "bn" 
                ? "সতর্কতা: এই পদক্ষেপটি অপূরণীয়। ডিলিট করার পর ডাটাবেজ এবং ক্লায়েন্ট হিস্ট্রি থেকে এই নির্বাচিত ডাটাগুলো চিরতরে হারিয়ে যাবে।" 
                : "Warning: This action cannot be undone. Once deleted, these selected entries will be permanently removed from database and client histories."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === "bn" ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const newEng = engineeringReports.filter(eng => !selectedReportIds.includes(eng.id));
                  if (newEng.length !== engineeringReports.length) {
                     setEngineeringReports(newEng);
                     localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(newEng));
                     selectedReportIds.forEach(id => {
                       if (engineeringReports.find(e => e.id === id)) deleteDocument("engineeringReports", id);
                     });
                  }
                  
                  const newReports = reports.filter(r => !selectedReportIds.includes(r.id));
                  if (newReports.length !== reports.length) {
                     onUpdateReports(newReports);
                     selectedReportIds.forEach(id => {
                       if (reports.find(e => e.id === id)) deleteDocument("serviceReports", id);
                     });
                  }
                  
                  setSelectedReportIds([]);
                  setShowBulkDeleteConfirm(false);
                  setIsDeleteSelectionMode(false);
                }}
                className="px-5 py-2 bg-red-650 hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-red-500/15"
              >
                {language === "bn" ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete Selected"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VALIDATION PREVIEW BEFORE DOWNLOAD */}
      {previewReport && (() => {
        const report = previewReport;

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-all animate-fadeIn font-sans">
            <div className="bg-[#FFFDF3] border-2 border-slate-900 max-w-4xl w-full h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative text-slate-900 font-sans border-t-8 border-t-indigo-650 animate-scale-up">
              
              {/* Header Tools (Hidden in Print) */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-rose-550 text-xs">●</span>
                  <span className="text-xs font-black tracking-widest font-mono text-slate-300">
                    {language === "bn" ? "অপারেশন প্রুফ ভিউয়ার" : "AL WAFA STAR PDF COMPLIANCE GATEWAY"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      downloadFullReportPDF(report);
                      setPreviewReport(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow"
                  >
                    <span className="text-sm">📥</span>
                    <span>
                      {language === "bn" ? "সরাসরি PDF ডাউনলোড" : "Download PDF"}
                    </span>
                  </button>

                  <button
                    onClick={() => setPreviewReport(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow border border-slate-700"
                  >
                    <span>✕ {language === "bn" ? "ফিরে যান" : "Close"}</span>
                  </button>
                </div>
              </div>

              {/* Print Friendly Sandbox Tip (Hidden in print) */}
              <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center gap-2 no-print shrink-0">
                <span className="animate-pulse">💡</span>
                <p className="leading-normal">
                  {language === "bn"
                    ? "ইন্টারনেট ব্রাউজার থেকে সরাসরি PDF ডাউনলোড করতে উপরের প্রিন্ট বাটনে চাপ দিন। কোনো কারণে পপআপ বা উইন্ডো না খুললে, স্ক্রীনের উপরে ডানে থাকা 'Open in New Tab' বাটনে ক্লিক করে অ্যাপটি খুলুন।"
                    : "To download as PDF, click print and choose 'Save as PDF'. If the print layout is blocked, please click the native 'Open in New Tab' portal launcher on the top right."}
                </p>
              </div>

              {/* Document page viewport */}
              <div className="flex-1 overflow-auto p-0 bg-[#323639] w-full relative">
                <iframe 
                  srcDoc={report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language)} 
                  className="w-full h-full border-0 bg-[#323639]" 
                  title="Report Preview" 
                />
              </div>

            </div>
          </div>
        );
      })()}

      {/* SCREEN-CENTERED CLINIC/HOSPITAL SELECTION MODAL */}
      {activeModalReportId && (() => {
        const activeModalReport = reports.find(r => r.id === activeModalReportId);
        if (!activeModalReport) return null;

        const currentEmirate = activeModalReport.emirate || "Ajman";
        const currentSelectedValue = activeModalReport.facilityName || "";
        const allSuggestions = getFacilitiesForEmirate(currentEmirate);
        
        // Filter suggestions based on what's typed in the search box
        const filtered = allSuggestions.filter(facility => 
          facility.toLowerCase().includes(facilitySearchQuery.toLowerCase())
        );

        const handleAddAndSelect = (customName: string) => {
          const trimmed = customName.trim();
          if (!trimmed) return;
          
          // Save option to custom storage list for this Emirate
          saveCustomFacility(currentEmirate, trimmed);
          
          // Set values on current spreadsheet item
          handleExcelCellChange(activeModalReport.id, "facilityName", trimmed);
          
          // Clean up states
          setFacilitySearchQuery("");
          setActiveModalReportId(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 animate-fade-in font-sans">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-scale-up">
              
              {/* Modal Header */}
              <div className="p-3 px-4 border-b border-slate-800 bg-[#0F172A] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏥</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">
                      {language === "bn" ? "ক্লিনিক ও হসপিটাল ম্যানেজার" : "Clinic & Hospital Manager"}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold font-mono">
                      {language === "bn" ? `স্থান: ${currentEmirate}` : `Emirate: ${currentEmirate}`}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalReportId(null);
                    setFacilitySearchQuery("");
                  }}
                  className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold transition-all text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Core Content */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 select-text">
                
                {/* Search & Dynamic Registration Input section */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-[#10B981] block">
                    {language === "bn" ? "ক্লিনিক খুঁজুন অথবা নতুন তৈরি করুন" : "Search or Create"}
                  </label>
                  
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={facilitySearchQuery}
                        onChange={(e) => setFacilitySearchQuery(e.target.value)}
                        placeholder={language === "bn" ? "নাম..." : "Clinic/hospital name..."}
                        className="w-full bg-slate-950 text-slate-150 border border-slate-700/80 rounded-lg py-1.5 px-2.5 pr-7 text-[10.5px] font-bold font-sans outline-none focus:border-[#10B981] transition"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAndSelect(facilitySearchQuery);
                          }
                        }}
                        autoFocus
                      />
                      {facilitySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setFacilitySearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!facilitySearchQuery.trim()}
                      onClick={() => handleAddAndSelect(facilitySearchQuery)}
                      className="bg-[#10B981] disabled:bg-slate-800 disabled:text-slate-600 hover:bg-emerald-400 text-slate-950 font-black px-2.5 rounded-lg text-[10.5px] transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transform active:scale-95 duration-75 shrink-0"
                      title={language === "bn" ? "নতুন নাম যোগ করুন" : "Add as selected"}
                    >
                      <span className="text-xs">➕</span>
                      <span>{language === "bn" ? "যোগ" : "Add"}</span>
                    </button>
                  </div>
                </div>

                {/* Suggestions List container */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="uppercase tracking-wider font-extrabold text-slate-400">
                      {language === "bn" ? `নিবন্ধিত ক্লিনিক সমূহ` : `Registered`}: {filtered.length}
                    </span>
                    {facilitySearchQuery && (
                      <button 
                        onClick={() => setFacilitySearchQuery("")}
                        className="text-[#10B981] font-bold hover:underline cursor-pointer"
                      >
                        {language === "bn" ? "সবগুলো" : "Reset"}
                      </button>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800/60 p-1.5">
                    {filtered.length === 0 ? (
                      <div className="p-4 text-center space-y-1">
                        <span className="text-lg block">🏥</span>
                        <p className="text-[10px] text-slate-500 font-bold italic">
                          {language === "bn" ? "কোন তথ্য পাওয়া যায়নি" : "No clinics found"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-0.5">
                        {filtered.map((facility) => {
                          const isSelected = currentSelectedValue.toLowerCase().trim() === facility.toLowerCase().trim();
                          return (
                            <button
                              key={facility}
                              type="button"
                              onClick={() => {
                                handleExcelCellChange(activeModalReport.id, "facilityName", facility);
                                setActiveModalReportId(null);
                                setFacilitySearchQuery("");
                              }}
                              className={`w-full text-left py-1.5 px-2.5 rounded-md text-[10px] font-bold transition flex items-center justify-between gap-1.5 cursor-pointer ${
                                isSelected 
                                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" 
                                  : "text-slate-200 hover:bg-slate-900 override-border"
                              }`}
                            >
                              <span className="truncate">{facility}</span>
                              {isSelected && (
                                <span className="text-[8px] font-extrabold text-[#10B981] shrink-0 font-mono">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-850 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalReportId(null);
                    setFacilitySearchQuery("");
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  {language === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
