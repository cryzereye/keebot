"use strict";
exports.__esModule = true;
exports.ChannelConfig = void 0;
var ChannelConfig = /** @class */ (function () {
    function ChannelConfig(data) {
        this.setValue(data);
    }
    ChannelConfig.prototype.getValue = function () {
        return this.id;
    };
    ChannelConfig.prototype.setValue = function (data) {
        this.name = data.name;
        this.id = data.id;
    };
    return ChannelConfig;
}());
exports.ChannelConfig = ChannelConfig;
