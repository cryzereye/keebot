/**
 * adds a point to the given user + its transaction target
 * @param {Collection} [db] collection instance
 * @param {string} [id] discord ID
 * @param {string} [username] discord username
 * @param {string} [target] username of target discord user
 */
exports.addPoint = async (coll, id, name, target) => {
  let record;
  record = await coll.findOne({ discordID: id }).catch(console.error);

  if (record != null) {
    let trans = record.transactions;
    if (trans[target] == null)
      trans[target] = 0;
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
        }
      }
    ).then(
      console.log("New transaction for " + name + " with " + target)
    ).catch(console.error);
  }
  else
    await coll.insertOne(this.newRecord(id, name, target)).then(
      console.log("New record for " + name + " with " + target)
    ).catch(console.error);
}

/**
 * will return a JSON object for a new insert
 * @param {string} [id] discord ID
 * @param {string} [name] discord username
 * @param {string} [target] username of targer discord user
 */
exports.newRecord = async (id, name, target) => {
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
exports.getScore = async (db, id) => {
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
exports.findRecord = async (db, id) => {
  return await db.findOne({ discordID: id }).catch(console.error);
}

/**
 * clears all documents within Score
 */
exports.clearScores = async (db) => {
  await db.deleteMany({}).catch(console.error);
}