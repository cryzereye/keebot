const { MongoClient } = require('mongodb');
const { Score } = require('../models/Score');
const { Config } = require('../models/Config');
const { connURI, dbname, collnames } = require('../json/config.json');

class DBManager {
  constructor() {
    this.dbclient = new MongoClient(connURI);

    console.log("Connecting to database...");
    this.dbclient.connect((err, db) => {
      this.scoredb = db.db(dbname).collection(collnames[0]);
      if(this.scoredb != undefined)
        this.score = new Score();

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
  addScore(id, username, target) {
    this.score.addPoint(this.dbclient, this.scoredb, id.toString(), username, target);
  }

  getScore(id) {
    this.score.getScore(this.scoredb, id.toString());
  }

  clearScores(){
    this.score.clearScores(this.scoredb);
  }
}

module.exports = { DBManager }