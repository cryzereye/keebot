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
  async addPoint(client, coll, id, name, target) {
    // from: https://www.mongodb.com/blog/post/quick-start-nodejs--mongodb--how-to-implement-transactions
    // from: https://www.mongodb.com/docs/drivers/node/current/fundamentals/transactions/
    const session = client.startSession();
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    };

    let record;

    try{
      await session.withTransaction(async () => {
        session.startTransaction(transactionOptions);
        record = await coll.findOne({ discordID: id }, { session }).catch(console.error);
        if (record != undefined) {
          let trans = record.transactions;
    
          if(trans[target] == null) {
            console.log("New transaction for " + name + " with " + target);
            trans[target] = 0;
          }
          trans[target]++;
    
          await coll.findOneAndUpdate(
            { discordID: id },
            {
              $set: {
                username: name,
                transactions: trans
              },
              $inc: {
                points: 1,
                // TODO:`transactions.${target}`:1 --- increment target by 1
              }
            },
            { session }
          ).catch(console.error);
        }
        else
          await coll.insertOne(this.newRecord(id, name, target), { session }).catch(console.error);
        await session.commitTransaction();
      }, transactionOptions);
    }
    catch(err) {
      console.log(err);
      console.log(`Error inserting/updating record for ${name}`);
      await session.abortTransaction();
    }
    finally{
      await session.endSession();
    }
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
    let record = db.find({ discordID: id }).catch(console.error);
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
    return await db.find({ discordID: id }).catch(console.error);
  }

  /**
   * clears all documents within Score
   */
  async clearScores(db){
    await db.remove({ discordID: { $ne: "0" } }).catch(console.error);
  }
}

module.exports = { Score }