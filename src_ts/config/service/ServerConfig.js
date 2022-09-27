"use strict";
exports.__esModule = true;
exports.ServerConfig = void 0;
var ConfigType_1 = require("../model/enums/ConfigType");
var ChannelConfig_1 = require("./ChannelConfig");
var RoleConfig_1 = require("./RoleConfig");
var FilterConfig_1 = require("./FilterConfig");
var ServerConfig = /** @class */ (function () {
    function ServerConfig(serverID, channels, roles, filters) {
        this.serverID = serverID;
        this.channels = channels;
        this.roles = roles;
        this.filters = filters;
    }
    ServerConfig.prototype.getValue = function () {
        return this;
    };
    ServerConfig.prototype.setValue = function (data) {
        this.serverID = data.serverID;
        this.channels = data.channels;
        this.roles = data.roles;
        this.filters = data.filters;
    };
    ServerConfig.prototype.addProperty = function (type, value) {
        try {
            switch (type) {
                case ConfigType_1.ConfigType.Channel: {
                    var data = value;
                    this.channels.push(new ChannelConfig_1.ChannelConfig(data));
                }
                case ConfigType_1.ConfigType.Role: {
                    var data = value;
                    this.roles.push(new RoleConfig_1.RoleConfig(data));
                }
                case ConfigType_1.ConfigType.Filter: {
                    var data = value;
                    this.filters.push(new FilterConfig_1.FilterConfig(data));
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    ServerConfig.prototype.getConfigValue = function (type, property) {
        switch (type) {
            case ConfigType_1.ConfigType.Channel: return this.channels.filter(function (ch) { return ch.name === property; })[0].id;
            case ConfigType_1.ConfigType.Role: return this.roles.filter(function (r) { return r.id === property; })[0].id;
            case ConfigType_1.ConfigType.Filter: return this.filters.filter(function (f) { return f.id === property; })[0].filter;
        }
    };
    return ServerConfig;
}());
exports.ServerConfig = ServerConfig;
