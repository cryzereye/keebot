const { dev } = require('../../json/config.json');
const fs = require('fs');
const path = require('path');
/**
 * from: https://www.codegrepper.com/code-examples/javascript/node+js+time+difference+in+hours
 * returns time difference from now to target
 * @param {Date} target 
 */
exports.getTimeDiff = (target) => {
	let result = {}
	let now = Date.now();
	let ms = (now - target); // milliseconds between now & target 

	let years = Math.floor(ms / 31557600000);
	let months = Math.floor((ms % 31557600000) / 2629800000);
	let days = Math.floor(((ms % 31557600000) % 2629800000) / 86400000);
	let hours = Math.floor((((ms % 31557600000) % 2629800000) % 86400000) / 3600000);
	let mins = Math.round(((((ms % 31557600000) % 2629800000) % 86400000) % 3600000) / 60000);

	if (years != 0) result["years"] = `${years} years`;
	if (months != 0) result["months"] = `${months} months`;
	if (days != 0) result["days"] = `${days} days`;
	if (hours != 0) result["hours"] = `${hours} hours`;
	if (mins != 0) result["mins"] = `${mins} mins`;

	return result;
}

/**
 * returns date equivalent or adding x hours to the date start
 * @param {Date} start 
 * @param {Number} hours 
 * @returns {Date}
 */
exports.addHours = (start, hours) => {
	let date = new Date(start);
	if (dev)
		date.setTime(date.getTime() + hours * 60 * 1000); // x mins for test purposes
	else
		date.setTime(date.getTime() + hours * 60 * 60 * 1000); // hours * 1 hour
	return date.toString();
}

/**
 * get ms equivalent of arg mins for js date/time usages
 * @param {Number} mins 
 * @returns {Number} ms in mins
 */
exports.getMinutes = (mins) => {
	return mins * 60 * 1000;
}

/**
 * returns true if str is a digit string sandwiched in words
 * @param {String} str 
 * @returns {Boolean}
 */
exports.isValidAmount = (str) => {
	let regexp = /\w*\d+\w*/gi;
	return regexp.test(str);
}

exports.copyAllFiles = (src, dest) => {
	this.createFolder(dest);

	// Get list of files in source directory
	const files = fs.readdirSync(src);

	// Copy each file to the destination directory
	files.forEach(file => {
		const srcPath = path.join(src, file);
		const destPath = path.join(dest, file);
		fs.copyFileSync(srcPath, destPath);
	});
}

exports.createFolder = (dest) => {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest);
	}
}