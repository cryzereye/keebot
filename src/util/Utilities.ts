import fs from 'fs';
import path from 'path';
import { TimeDiff } from "./types/TimeDiff.js";

import { dev } from '../../json/config.json' assert { type: "json" };

export class Utilities {
	constructor() {
		return;
	}

	/**
	  * from: https://www.codegrepper.com/code-examples/javascript/node+js+time+difference+in+hours
	  * returns time difference from now to target
	  * @param {Date} target 
	  */
	public getTimeDiff(target: Date): TimeDiff {
		const now = Date.now(); // already in milliseconds
		const ms = (now - target.getMilliseconds());

		const years: number = Math.floor(ms / 31557600000);
		const months: number = Math.floor((ms % 31557600000) / 2629800000);
		const days: number = Math.floor(((ms % 31557600000) % 2629800000) / 86400000);
		const hours: number = Math.floor((((ms % 31557600000) % 2629800000) % 86400000) / 3600000);
		const mins: number = Math.round(((((ms % 31557600000) % 2629800000) % 86400000) % 3600000) / 60000);

		const result: TimeDiff = [
			(years > 0 ? `${years} years` : ""),
			(months > 0 ? `${months} months` : ""),
			(days > 0 ? `${days} days` : ""),
			(hours > 0 ? `${hours} hours` : ""),
			(mins > 0 ? `${mins} mins` : "")
		]

		return result;
	}

	public addHours(start: Date, hours: number): Date {
		if (dev)
			start.setTime(start.getTime() + hours * 60 * 1000); // x mins for test purposes
		else
			start.setTime(start.getTime() + hours * 60 * 60 * 1000); // hours * 1 hour
		return start;
	}

	/**
	  * get ms equivalent of arg mins for js date/time usages
	  * @param {number} mins 
	  * @returns {number} ms in mins
	  */

	getMinutes(mins: number): number {
		return mins * 60 * 1000;
	}

	/**
	  * returns true if str is a digit string sandwiched in words
	  * @param {string} str 
	  * @returns {boolean}
	  */
	isValidAmount(str: string): boolean {
		const regexp = /\w*\d+\w*/gi;
		return regexp.test(str);
	}

	public copyAllFiles(src: string, dest: string): void {
		this.createFolder(dest);

		// Get list of files in source directory
		const files = fs.readdirSync(src);

		// Copy each file to the destination directory
		files.forEach((file: string) => {
			const srcPath = path.join(src, file);
			const destPath = path.join(dest, file);
			fs.copyFileSync(srcPath, destPath);
		});
	}

	public createFolder(dest: string): void {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}
	}
}