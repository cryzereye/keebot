const { MongoClient } = require('mongodb');
const { Score } = require('../models/Score');
const { Config } = require('../models/Config');
const { connURI } = require('../json/config.json');

class DBManager {
  constructor() {
    this.dbclient = new MongoClient(connURI);
    this.score = this.dbclient.score;
    this.config = this.dbclient.config;

    if (await client.connect()) {
      console.log("MongoDB connected!");
    }
  }

  /**
   * adds a point to the given id
   * @type {null}
   * @param {int} [id] discord ID
   * @param {string} [username] discord username
   * @param {string} [target] username of targer discord user
   */
  addScore(id, username, target) {
    Score.addpoint(this.score, id, username, target);
  }

  getScore(id) {
    Score.getScore(this.score, id);
  }
}

module.exports = { DBManager }