class Utilities {
  constructor() { }

  /**
   * from: https://www.codegrepper.com/code-examples/javascript/node+js+time+difference+in+hours
   * returns time difference from now to target
   * @param {Date} target 
   */
  getTimeDiff(target) {
    let result = {} 
    let now = Date.now();
    let ms = (now - target); // milliseconds between now & target 
    
    let years = Math.floor( ms / 31557600000);
    let months = Math.floor(( ms % 31557600000) / 2629800000 );
    let days = Math.floor((( ms % 31557600000) % 2629800000 ) / 86400000);
    let hours = Math.floor(((( ms % 31557600000) % 2629800000) % 86400000) / 3600000); 
    let mins = Math.round((((( ms % 31557600000) % 2629800000) % 86400000) % 3600000) / 60000);

    if(years != 0) result["years"] = `${years} years`;
    if(months != 0) result["months"] = `${months} months`;
    if(days != 0) result["days"] = `${days} days`;
    if(hours != 0) result["hours"] = `${hours} hours`;
    if(mins != 0) result["mins"] = `${mins} mins`;

    return result;
  }
}

module.exports = { Utilities }