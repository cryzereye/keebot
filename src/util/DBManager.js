const { MongoClient } = require('mongodb');
const Score = require('../models/Score');
const VouchMsg = require('../models/VouchMsg');
const async = require('async')
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

    this.defineQueue();
  }

  /**
   * https://www.geeksforgeeks.org/node-js-async-queue-method/
   */
  defineQueue() {
    console.log("Defining queue..");
    this.queue = async.queue((task, completed) => {
      console.log("Currently Busy Processing Task " + task);

      setTimeout(() => {
        const remaining = this.queue.length();
        completed(null, { task, remaining });
      }, 1000);
    }, 1);
    console.log("Async queue defined!");
  }

  getStats(id) {
    return addJob(Score.getStats(this.colldb[0], id.toString()));
  }

  saveVouch(msgid, authorID, authorName, mentioned, content) {
    return addJob(VouchMsg.saveVouch(this.colldb[0], msgid, authorID, authorName, mentioned, content));
  }

  deleteVouch(msgid) {
    return addJob(VouchMsg.deleteOne(this.colldb[0], msgid));
  }

  updateVouch(msgid) {
    return addJob(VouchMsg.deleteOne(this.colldb[0], msgid));
  }

  deleteAllVouch() {
    return addJob(VouchMsg.deleteAll(this.colldb[0]));
  }

  getAllVouch() {
    return addJob(VouchMsg.getAll(this.colldb[0]));
  }

  /**
   * https://www.geeksforgeeks.org/node-js-async-queue-method/
   * @param {function} job 
   */
  addJob(job) {
    this.queue.push(job, (error, { job, remaining }) => {
      if (error) {
        console.log(`An error occurred while processing task ${job}`);
      } else {
        console.log(`Finished processing task ${job}
                 . ${remaining} tasks remaining`);
        return job;
      }
    });
  }

}

module.exports = { DBManager }