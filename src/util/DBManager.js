const { MongoClient } = require('mongodb');
const Score = require('../models/Score');
const VouchMsg = require('../models/VouchMsg');
const { connURI, dbname, collnames } = require('../json/config.json');

class DBManager {
  constructor() {
    this.dbclient = new MongoClient(connURI);

    console.log("Connecting to database...");
    this.dbclient.connect((err, db) => {
      this.colldb = [];
      this.colldb[0] = db.db(dbname).collection(collnames[0]);
      this.colldb[1] = db.db(dbname).collection(collnames[1]);
      if(this.colldb[0] != undefined) {
        console.log(`${collnames[0]} connected`);
      }
      if(this.colldb[1] != undefined)
      console.log(`${collnames[1]} connected`);

      console.log("Connected to database!");
    }).catch(console.error);
  }

  /**
   * adds a point to the given id
   * @type {null}
   * @param {int} [id] discord ID
   * @param {string} [username] discord username
   * @param {string} [target] username of targer discord user
   */
  async addScore(id, username, target) {
    await Score.addPoint(this.dbclient, this.scoredb, id.toString(), username, target);
  }

  async getScore(id) {
    return await Score.getScore(this.scoredb, id.toString());
  }

  async clearScores(){
    await Score.clearScores(this.scoredb);
  }

  async findRecord(id){
    return await Score.findRecord(this.scoredb, id.toString()).catch(console.error);
  }

  async saveVouch(msgid, authorID, authorName, mentioned, content){
    await VouchMsg.saveVouch(this.vouchmsgdb, msgid, authorID, authorName, mentioned, content);
  }

  async deleteVouch(msgid){
    await VouchMsg.deleteOne(this.vouchmsgdb, msgid);
  }

  async updateVouch(msgid){
    await VouchMsg.deleteOne(this.vouchmsgdb, msgid);
  }
}

module.exports = { DBManager }