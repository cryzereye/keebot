"use strict";
exports.__esModule = true;
exports.RoleConfig = void 0;
var RoleConfig = /** @class */ (function () {
    function RoleConfig(data) {
        this.setValue(data);
    }
    RoleConfig.prototype.getValue = function () {
        return this.id;
    };
    RoleConfig.prototype.setValue = function (data) {
        this.id = data.id;
    };
    return RoleConfig;
}());
exports.RoleConfig = RoleConfig;
