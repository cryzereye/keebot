import fs = require('fs');
import path = require('path');
import * as TransactionType from '../models/enums/TransactionType.js';
import * as TimeDiff from "./types/TimeDiff.js";

import { dev } from '../../json/config.json';

/**
 * from: https://www.codegrepper.com/code-examples/javascript/node+js+time+difference+in+hours
 * returns time difference from now to target
 * @param {Date} target 
 */
export function getTimeDiff(target: Date): TimeDiff.TimeDiff {
	const now = Date.now(); // already in milliseconds
	const ms = (now - target.getMilliseconds());

	const years: number = Math.floor(ms / 31557600000);
	const months: number = Math.floor((ms % 31557600000) / 2629800000);
	const days: number = Math.floor(((ms % 31557600000) % 2629800000) / 86400000);
	const hours: number = Math.floor((((ms % 31557600000) % 2629800000) % 86400000) / 3600000);
	const mins: number = Math.round(((((ms % 31557600000) % 2629800000) % 86400000) % 3600000) / 60000);

	const result: TimeDiff.TimeDiff = [
		(years > 0 ? `${years} years` : ""),
		(months > 0 ? `${months} months` : ""),
		(days > 0 ? `${days} days` : ""),
		(hours > 0 ? `${hours} hours` : ""),
		(mins > 0 ? `${mins} mins` : "")
	]

	return result;
}

/**
 * returns date equivalent or adding x hours to the date start
 * @param {string} start 
 * @param {number} hours 
 * @returns {string}
 */
export function addHours(start: string, hours: number): string {
	const date = new Date(start);
	if (dev)
		date.setTime(date.getTime() + hours * 60 * 1000); // x mins for test purposes
	else
		date.setTime(date.getTime() + hours * 60 * 60 * 1000); // hours * 1 hour
	return date.toString();
}

/**
 * get ms equivalent of arg mins for js date/time usages
 * @param {number} mins 
 * @returns {number} ms in mins
 */
export function getMinutes(mins: number): number {
	return mins * 60 * 1000;
}

/**
 * returns true if str is a digit string sandwiched in words
 * @param {string} str 
 * @returns {boolean}
 */
export function isValidAmount(str: string): boolean {
	const regexp = /\w*\d+\w*/gi;
	return regexp.test(str);
}

export function copyAllFiles(src: string, dest: string): void {
	createFolder(dest);

	// Get list of files in source directory
	const files = fs.readdirSync(src);

	// Copy each file to the destination directory
	files.forEach((file: string) => {
		const srcPath = path.join(src, file);
		const destPath = path.join(dest, file);
		fs.copyFileSync(srcPath, destPath);
	});
}

export function createFolder(dest: string): void {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest);
	}
}

export function getTransactionType(type: string | null): TransactionType.TransactionType {
	switch (type) {
		case "buy": return TransactionType.TransactionType.buy;
		case "sell": return TransactionType.TransactionType.sell;
		case "trade": return TransactionType.TransactionType.trade;
	}

	return TransactionType.TransactionType.buy;
}