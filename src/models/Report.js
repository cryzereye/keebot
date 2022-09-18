const fs = require('fs');
const fileName = '../json/reports.json';
const osFile = './src/json/reports.json';
let { reports } = require(fileName);

exports.saveReportToFile = () => {
  let dataStr = { "reports": reports };
  try {
    fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
      if (err) return console.log(err);
    });
  }
  catch (err) {
    console.log(err);
  }
}

exports.fileNewReport = (authorID, authorName, targetID, targetName, category, summary, date) => {
  const reportID = this.getReportCountFromFile() + 1;
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
  this.saveReportToFile();
  return reportID;
}

exports.verifyReportFromFile = (id, verified, verifier, verifyDate) => {
  if (reports[id].verified)
    return { verified: false, report: reports[id] };
  else {
    reports[id].verified = verified;
    reports[id].verifier = verifier;
    reports[id].verifyDate = verifyDate;
    this.saveReportToFile();
    return { verified: true, report: reports[id] };
  }
}

exports.getReportCountFromFile = () => {
  return Object.keys(reports).length;
}

exports.countVerifiedReportsForUser = (targetid) => {
  let count = 0;
  Object.keys(reports).forEach((key) => {
    if (reports[key].targetID === targetid && reports[key].verified) {
      count++;
    }
  });
  return count;
}

/**
 * below are db-related functions
 */

exports.saveReportToDB = () => {

}

exports.updateReportFromDB = () => {

}