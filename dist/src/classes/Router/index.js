"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
class Router {}
Router.routes = {};
Router.parseUrl = (method, urlString) => {
  if (!urlString) {
    return;
  }
  const parsedUrl = url_1.default.parse(urlString, true);
  const data =
    parsedUrl.pathname &&
    Router.getPrettyData(method, decodeURI(parsedUrl.pathname));
  if (data && parsedUrl.pathname) {
    parsedUrl.query = Object.assign({}, parsedUrl.query, { ...data });
    parsedUrl.pathname = Router.getPathName(parsedUrl.pathname);
  }
  return parsedUrl;
};
Router.getPathName = (path) => {
  if (path) {
    const newPathName = path.match(/\/\w+(?=\/)/);
    return newPathName ? newPathName[0] : path;
  }
  return null;
};
Router.handleRequest = (req, res) => {
  let _a;
  if (req.method) {
    const reqInfo = Router.parseUrl(req.method, req.url);
    console.log(req.method, req.url, reqInfo);
    try {
      if ((_a = reqInfo) === null || _a === void 0 ? void 0 : _a.pathname) {
        const route = Router.routes[req.method][reqInfo.pathname];
        route.callback(req, res, reqInfo.query);
      } else {
        throw new Error("Unable to identify path");
      }
    } catch (e) {
      // TODO: RETURN ERROR CODES
      console.log(e);
    }
  }
};
Router.getPrettyData = (method, urlString) => {
  let _a;
  let _b;
  console.log(urlString);
  const match =
    (_a = urlString.match(
      /(?<=\/)(((\w+)?(("\w+(\/)?\w+"|-|,|\w+|\s+|\.)+)?)|\w+|\/)/gi
    )) === null || _a === void 0
      ? void 0
      : _a.map((string, index) => {
          if (index === 0) {
            return "/" + string;
          } else {
            return string.replace(/^\//, "");
          }
        });
  console.log({ match });
  const pathname = (_b = match) === null || _b === void 0 ? void 0 : _b.shift();
  if (match && match.length) {
    if (
      pathname &&
      Router.routes[method] &&
      Router.routes[method][pathname] &&
      Router.routes[method][pathname]["data"]
    ) {
      const copiedObject = Object.entries(
        Router.routes[method][pathname]["data"]
      );
      match.forEach((item, index) => {
        copiedObject[index] ? (copiedObject[index][1] = item) : 0;
      });
      return Object.fromEntries(copiedObject);
    }
  }
};
Router.createRoute = (method, pathName, callback) => {
  const strip = pathName.match(/(?!\?)(\w+)(?=\:)/gi);
  const newPathName = pathName.match(/\/\w+(?=\/)/);
  let data = {};
  pathName = newPathName && newPathName[0] ? newPathName[0] : pathName;
  if (strip) {
    const objectKeys = strip.map((values) => {
      return [values, null];
    });
    data = Object.fromEntries(objectKeys);
  }
  Router.routes[method]
    ? (Router.routes[method][pathName] = { callback, data })
    : (Router.routes[method] = { [pathName]: { callback, data } });
};
exports.default = Router;
