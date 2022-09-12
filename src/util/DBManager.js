const { MongoClient } = require('mongodb');
const Score = require('../models/Score');
const VouchMsg = require('../models/VouchMsg');
const { QueueManager } = require('../util/QueueManager');
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
    this.queue = new QueueManager();
  }

  async getStats(id) {
    return await this.addAsyncJob(Score.getStats(this.colldb[0], id.toString()));
  }

  async saveVouch(msgid, authorID, authorName, mentioned, content) {
    return await this.addAsyncJob(VouchMsg.saveVouch(this.colldb[0], msgid, authorID, authorName, mentioned, content));
  }

  async deleteVouch(msgid) {
    return await this.addAsyncJob(VouchMsg.deleteOne(this.colldb[0], msgid));
  }

  async updateVouch(msgid) {
    return await this.addAsyncJob(VouchMsg.deleteOne(this.colldb[0], msgid));
  }

  async deleteAllVouch() {
    return await this.addAsyncJob(VouchMsg.deleteAll(this.colldb[0]));
  }

  async getAllVouch() {
    return await this.addAsyncJob(VouchMsg.getAll(this.colldb[0]));
  }

  async addAsyncJob(action) {
    return await this.queue.enqueue(action);
  }
}

module.exports = { DBManager }