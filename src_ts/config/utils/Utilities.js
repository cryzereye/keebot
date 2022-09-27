"use strict";
exports.__esModule = true;
exports.validFilter = exports.validroleName = exports.validChannelName = exports.validID = void 0;
var numRegex = new RegExp(/^\d+&/);
var channelNameRegex = new RegExp(/^(\d|\w|_)(\d|\w|_|-){0-99}$/); // starts with /w /d or _. /w /d - _ only. 100 chars max. no consecutive -
var roleNameRegex = new RegExp(/^.{1-100}$/);
function validID(id) {
    return numRegex.test(id);
}
exports.validID = validID;
function validChannelName(ch) {
    return channelNameRegex.test(ch);
}
exports.validChannelName = validChannelName;
function validroleName(role) {
    return roleNameRegex.test(role);
}
exports.validroleName = validroleName;
function validFilter(filter) {
    try {
        filter / 1; // test if number
        return (filter > 0); // test if valid filter value
    }
    catch (e) {
        return false;
    }
}
exports.validFilter = validFilter;
