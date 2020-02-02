"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Router {
    constructor() {
        this.routes = {};
        this.getPrettyData = (method, urlString) => {
            var _a, _b;
            const match = ((_a = urlString.match(/(\/)((\w+|\s)+(((\s+|-|,|=)?(\w)+))+)*/gi)) === null || _a === void 0 ? void 0 : _a.map((e, index) => {
                return index > 0 ? e.replace("/", "") : e;
            }));
            const pathname = (_b = match) === null || _b === void 0 ? void 0 : _b.shift();
            if (match && match.length) {
                if (pathname &&
                    this.routes[method] &&
                    this.routes[method][pathname] &&
                    this.routes[method][pathname]["data"]) {
                    const copiedObject = Object.entries(this.routes[method][pathname]["data"]);
                    match.forEach((item, index) => { copiedObject[index] ? copiedObject[index][1] = item : 0; });
                    return Object.fromEntries(copiedObject);
                    ;
                }
            }
        };
        this.createRoute = (method, pathName, callback) => {
            let strip = pathName.match(/(?!\?)(\w+)(?=\:)/gi);
            let newPathName = pathName.match(/\/\w+(?=\/)/);
            let data = {};
            pathName = newPathName && newPathName[0] ? newPathName[0] : pathName;
            if (strip) {
                const objectKeys = strip.map((values) => {
                    return [values, null];
                });
                data = Object.fromEntries(objectKeys);
            }
            this.routes[method] ?
                this.routes[method][pathName] = { callback, data } :
                this.routes[method] = { [pathName]: { callback, data } };
        };
    }
}
exports.default = Router;
