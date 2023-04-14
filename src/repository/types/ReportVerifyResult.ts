import { Report } from "../../models/Report.js";

export type ReportVerifyResult = {
    report: Report | undefined;
    gotVerified: boolean;
}