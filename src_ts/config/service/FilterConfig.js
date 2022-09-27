"use strict";
exports.__esModule = true;
exports.FilterConfig = void 0;
var FilterConfig = /** @class */ (function () {
    function FilterConfig(data) {
        this.setValue(data);
    }
    FilterConfig.prototype.getValue = function () {
        return this.filter;
    };
    FilterConfig.prototype.setValue = function (data) {
        this.id = data.id;
        this.role = data.role;
        this.filter = data.filter;
    };
    return FilterConfig;
}());
exports.FilterConfig = FilterConfig;
