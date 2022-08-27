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
    let record = await db.findOne({ discordID: id });

    if (record != undefined) {
      let trans = record.transactions;

      if(trans[target] == null) {
        console.log("New transaction for " + name + " with " + target);
        trans[target] = 0;
      }
      trans[target]++;

      await db.updateOne(
        { discordID: id },
        {
          $set: {
            username: name,
            points: record.points + 1,
            transactions: trans
          }
        }
      );
    }
    else
      await db.insertOne(this.newRecord(id, name, target));
  }

  /**
   * will return a JSON object for a new insert
   * @param {string} [id] discord ID
   * @param {string} [name] discord username
   * @param {string} [target] username of targer discord user
   */
  newRecord(id, name, target) {
    console.log("New record for " + name + " with " + target);
    let str = `{
      "discordID": "${id}",
      "username": "${name}",
      "points": 1,
      "transactions": {
        "${target}" : 1
      }}`;

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
    if (record != null) {
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
  async findRecord(db, id) {
    return await db.findOne({ discordID: id });
  }

  /**
   * clears all documents within Score
   */
  async clearScores(db){
    await db.remove({ discordID: { $ne: "0" } });
  }
}

module.exports = { Score }