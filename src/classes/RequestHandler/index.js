"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router_1 = __importDefault(require("./Router"));
const url_1 = __importDefault(require("url"));
class RequestHandler {
    constructor() {
        this.router = new Router_1.default;
        this.urlInfo = null;
        /**
         * parses the url from a pretty url (i.e /example/product/type)
         */
        this.parseUrl = (method, urlString) => {
            if (!urlString)
                return;
            this.urlInfo = url_1.default.parse(urlString, true);
            const data = this.urlInfo.pathname && this.router.getPrettyData(method, decodeURI(this.urlInfo.pathname));
            if (data)
                this.urlInfo.query = Object.assign({}, this.urlInfo.query, { ...data });
            this.urlInfo.pathname = this.getPathName();
        };
        this.getPathName = () => {
            if (this.urlInfo && this.urlInfo.pathname) {
                const newPathName = this.urlInfo.pathname.match(/\/\w+(?=\/)/);
                return newPathName ? newPathName[0] : this.urlInfo.pathname;
            }
            return null;
        };
        this.handleRequest = (req, res) => {
            req.method && req.url && this.parseUrl(req.method, req.url);
            if (req.method && this.urlInfo && this.urlInfo.pathname) {
                try {
                    const route = this.router.routes[req.method][this.urlInfo.pathname];
                    route.callback(req, res, this.urlInfo.query);
                }
                catch (e) {
                    // TODO: RETURN ERROR CODES
                    console.log(e);
                }
            }
        };
        return this;
    }
}
exports.default = RequestHandler;
