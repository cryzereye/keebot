import { Snowflake } from "discord.js";
import * as ReportType from "../functions/enums/ReportType.js";

import fs from 'fs';
import reports from '../../json/reports.json';
const osFile = './json/reports.json';

export function saveReportToFile(): void {
  const dataStr = { "reports": reports };
  try {
    fs.writeFile(osFile, JSON.stringify(dataStr), (err) => {
      if (err)
        return console.log(err);
    });
  }
  catch (err) {
    console.log(err);
  }
}

export function fileNewReport(authorID: Snowflake, authorName: string, targetID: Snowflake, targetName: string, category: ReportType.ReportType, summary: string, date: string): number {
  const reportID = getReportCountFromFile() + 1;
  reports[reportID] = {
    authorID: authorID,
    authorName: authorName,
    targetID: targetID,
    targetName: targetName,
    category: category,
    summary: summary,
    date: date,
    verified: false
  };
  saveReportToFile();
  return reportID;
}

export function verifyReportFromFile(id: number, verified: boolean, verifier: string, verifyDate: string): { verified: boolean, report: string } {
  if (reports[id].verified)
    return { verified: false, report: reports[id] };
  else {
    reports[id].verified = verified;
    reports[id].verifier = verifier;
    reports[id].verifyDate = verifyDate;
    saveReportToFile();
    return { verified: true, report: reports[id] };
  }
}

export function getReportCountFromFile(): number {
  return Object.keys(reports).length;
}

export function getVerifiedReportsForUser(targetid: Snowflake): any[] {
  const verifiedReports: any = [];
  Object.keys(reports).forEach((key: string) => {
    if (reports[key].targetID === targetid && reports[key].verified) {
      verifiedReports.push(reports[key]);
    }
  });
  return verifiedReports;
}