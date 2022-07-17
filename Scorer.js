const fs = require('fs');
const fileName = './json/scores.json';
const { scores } = require(fileName);

class Scorer {
  constructor(){
    console.log(scores);
  }

  addPoint(id1, id2){
    try{
      scores[id1.toString()].points +=1;
    }
    catch(err){
      createNewEntry(id1)
    }
    this.updateScoreFile();
  }

  getScore(id){
    return scores[id.toString()];
  }
  
  // from https://www.codegrepper.com/code-examples/javascript/frameworks/react/how+to+update+a+json+file+javascript
  // above included
  updateScoreFile(){
    fs.writeFile(fileName, JSON.stringify(scores), function writeJSON(err) {
      if (err) return console.log(err);
      console.log('Updated scores');
    });
  }

  createNewEntry(id){
    newdata = `{
      ${id.toString()}:{"points" : 1,"transactions":[{}]}
    }`
  }
}


module.exports = { Scorer }