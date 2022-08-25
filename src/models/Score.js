/**
 * holds all functions directly accessing the database
 */
class Score {
  constructor() { }

  /**
   * adds a point to the given user + its transaction target
   * @param {Collection} [db] collection instance
   * @param {string} [id] discord ID
   * @param {string} [username] discord username
   * @param {string} [target] username of targer discord user
   */
  async addPoint(db, id, name, target) {
    let record = await db.findOne({ discordID : id});

    if(record != undefined){
      db.updateOne(
        { discordID : id },
        {$set : { points : record.points + 1 }}
      );
      let trans = await db.findOne({ 
        discordID : id,
        "transactions.username" : target 
      });
      if(trans != undefined){
        db.updateOne(
          { 
            discordID : id,
            "transactions.username" : target 
          },
          { $set: { "transactions.points" : trans.points + 1 }}
        );
      }
      else {
        let newTrans = {username : target, points : 1};
        db.updateOne(
          { discordID : id},
          { $push: { transactions : newTrans }}
        );
      }
    }
    else
      db.insertOne(this.newRecord(id, name, target));
  }

  /**
   * will return a JSON object for a new insert
   * @param {Collection} [db] collection instance
   * @param {string} [id] discord ID
   * @param {string} [name] discord username
   * @param {string} [target] username of targer discord user
   */
  newRecord(id, name, target) {
    console.log("New record for " + name + " with " + target);
    console.log(id);
    let str = `{
      "discordID": "${id}",
      "username": "${name}",
      "points": 1,
      "transactions": [{
        "username": "${target}",
        "points": 1
      }]}`;

      return JSON.parse(str);
  }

  /**
   * returns the score of the given user's id
   * @param {MongoClient.<collection>} [db] collection instance
   * @param {string} [id] discord ID
   * @returns {number}
   */
  getScore(db, id) {
    let record = db.find({ discordID: id });
    if(record != null){
      return record.points;
    }
    return null;
  }

  /**
   * returns the JSON object of the user given its id
   * @param {MongoClient.<collection>} [db] collection instance
   * @param {number} [id] discord ID
   * @returns {Object{}}
   */
  findRecord(db, id){
    return db.find({ discordID: id });
  }
}

module.exports = { Score }