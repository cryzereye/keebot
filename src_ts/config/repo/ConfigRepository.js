"use strict";
exports.__esModule = true;
exports.ConfigRepository = void 0;
var _a = require('mongodb'), MongoClient = _a.MongoClient, Collection = _a.Collection;
var connURI = require('../../secrets').connURI;
var ConfigRepository = /** @class */ (function () {
    function ConfigRepository() {
        var _this = this;
        this.dbclient = new MongoClient(connURI);
        console.log("Connecting to database...");
        this.dbclient.connect(function (err, db) {
            _this.config = db.db('vouchbot').collection('config');
            console.log("Connected to config!");
        })["catch"](console.error);
    }
    /**
     * adds a new set of server config. should be called upon bot join
     * @param { ServerConfig } data
     */
    ConfigRepository.prototype.addNewServerConfig = function (data) {
        this.config.findOneAndUpdate({ serverID: data.serverID }, {
            serverID: data.serverID,
            channels: data.channels,
            roles: data.roles,
            filter: data.filters
        }, {
            upsert: true
        })["catch"](console.error);
    };
    ConfigRepository.prototype.getServerConfig = function (serverID) {
        return this.config.findOne({ serverID: serverID })["catch"](console.error);
    };
    ConfigRepository.prototype.getRoleConfig = function (serverID, roleID) {
        return this.config.findOne({
            serverID: serverID,
            roles: [roleID]
        })["catch"](console.error);
    };
    return ConfigRepository;
}());
exports.ConfigRepository = ConfigRepository;
