"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const mongoImport2 = (options) => {
  console.log(options);
  // console.log(options.split(/\s+/))
  return child_process_1.default.spawn(`mongoimport`, options.split(/\s+/));
};
exports.default = mongoImport2;
