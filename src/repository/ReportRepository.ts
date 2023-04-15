
import { Snowflake } from 'discord.js';
import { Report } from '../models/Report.js';
import { BaseRepository } from './BaseRepository.js';
import { ReportVerifyResult } from './types/ReportVerifyResult.js';

export class ReportRepository extends BaseRepository {
	cache: Array<Report>;
	constructor() {
		super(`json/reports.json`);
		this.cache = <Array<Report>>this.load().reports;
	}

	new(report: Report): number {
		this.cache.push(report);
		this.save(this.cache.toString());
		return report.id;
	}

	find(id: number): Report | undefined {
		return this.cache.find(report => report.id === id);
	}

	verify(id: number, verifier: string): ReportVerifyResult {
		const report = this.find(id);
		if (!report)
			return {
				report: undefined,
				gotVerified: false
			}

		if (report.verified)
			return {
				report: report,
				gotVerified: false
			}

		report.verify(verifier);
		this.save(this.cache.toString());

		return {
			report: report,
			gotVerified: true
		};
	}

	getVerifiedReportsForUser(targetID: Snowflake): Report[] {
		return this.cache.filter(report => report.targetID === targetID && report.verified);
	}
}