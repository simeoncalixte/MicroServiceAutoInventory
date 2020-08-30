"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// const code = zip.codes? console.log(zip.codes) : console.log("there are no codes");
const mongoClient_1 = __importDefault(require("../../database/mongoClient"));
const distanceFromArrays = (startingPoint) => {};
const getZipCoordinates = async (startingPoint) => {
  let _a;
  return await ((_a = mongoClient_1.default()) === null || _a === void 0
    ? void 0
    : _a.then((client) => {
        const query = client.db("Inventory").collection("locationServices");
        const findStartingPoint = query.findOne({
          zip: parseInt(startingPoint),
        });
        findStartingPoint.then(() => {
          // query.fi
        });
      }));
};
exports.default = { distanceFromArrays, getZipCoordinates };
