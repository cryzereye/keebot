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
      if(this.colldb[0] != undefined)
        console.log(`${collnames[0]} connected`);
      if(this.colldb[1] != undefined)
        console.log(`${collnames[1]} connected`);

      console.log("Connected to database!");
    });
  }

  /**
   * adds a point to the given id
   * @type {null}
   * @param {int} [id] discord ID
   * @param {string} [username] discord username
   * @param {string} [target] username of targer discord user
   */
  async addScore(id, username, target) {
    await Score.addPoint(this.colldb[0], id, username, target);
  }

  async getScore(id) {
    return await Score.getScore(this.colldb[0], id);
  }

  async clearScores(){
    await Score.clearScores(this.colldb[0]);
  }

  async findRecord(id){
    return await Score.findRecord(this.colldb[0], id.toString()).catch(console.error);
  }

  async saveVouch(msgid, authorID, authorName, mentioned, content){
    await VouchMsg.saveVouch(this.colldb[1], msgid, authorID, authorName, mentioned, content);
  }

  async deleteVouch(msgid){
    await VouchMsg.deleteOne(this.colldb[1], msgid);
  }

  async updateVouch(msgid){
    await VouchMsg.deleteOne(this.colldb[1], msgid);
  }

  async deleteAllVouch(){
    await VouchMsg.deleteAll(this.colldb[1]);
  }

  async getAllVouch(){
    return await VouchMsg.getAll(this.colldb[1]);
  }
}

module.exports = { DBManager }