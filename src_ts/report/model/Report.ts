import { User } from "./../../stats/model/User";
import type { ReportCategory } from "./ReportCategory";

export interface Report {
    source: User;
    target: User;
    category: ReportCategory;
    date: Date;
    summary: string;
    verified: boolean;
}