/**
 * holds all functions directly accessing the database
 */
class Score {
  constructor() { }

  /**
   * adds a point to the given user + its transaction target
   * @param {Collection} [db] collection instance
   * @param {int} [id] discord ID
   * @param {string} [username] discord username
   * @param {string} [target] username of targer discord user
   */
  addPoint(db, id, name, target) {
    let record = db.find({ _id : id});

    if(record.count() > 0){
      let trans = record.transactions.find({username : target});
      if(trans != undefined){
        record.transactions.updateOne(
          {username : target},
          {points : trans.points + 1}
        );
        record.updateOne(
          { _id : id},
          {points : record.points + 1}
        );
      }
    }
    else
      db.insertOne(this.newRecord(id, name, target));
  }

  /**
   * will return a JSON object for a new insert
   * @param {Collection} [db] collection instance
   * @param {int} [id] discord ID
   * @param {string} [name] discord username
   * @param {string} [target] username of targer discord user
   */
  newRecord(id, name, target) {
    let str = `{
      "_id": ${id},
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
   * @param {number} [id] discord ID
   * @returns {number}
   */
  getScore(db, id) {
    let record = db.find({ _id: id });
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
    return db.find({ _id: id });
  }
}

module.exports = { Score }