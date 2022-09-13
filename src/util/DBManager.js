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
      for (let i = 0; i < this.colldb.length; i++) {
        if (this.colldb[i] != undefined)
          console.log(`${collnames[0]} connected`);
      }
      console.log("Connected to database!");
    });
  }

  async getStats(id) {
    return await Score.getStats(this.colldb[0], id.toString());
  }

  async saveVouch(msgid, authorID, authorName, mentioned, content) {
    return await VouchMsg.saveVouch(this.colldb[0], msgid, authorID, authorName, mentioned, content);
  }

  async deleteVouch(msgid) {
    return await VouchMsg.deleteOne(this.colldb[0], msgid);
  }

  async updateVouch(msgid) {
    return await VouchMsg.deleteOne(this.colldb[0], msgid);
  }

  async deleteAllVouch() {
    return await VouchMsg.deleteAll(this.colldb[0]);
  }

  async getAllVouch() {
    return await VouchMsg.getAll(this.colldb[0]);
  }

}

module.exports = { DBManager }