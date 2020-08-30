import Importer from "../DataImporters/DownloadData";
import { sep } from "path";
import csvParser from "csv-parse";
import fs from "fs";
import transformer from "stream-transform";
import rootPath from "app-root-path";
import mkdir from "../../utils/createDirectory";

const fileLocation = `${sep}data${sep}location${sep}`;
const fileArchiveLocation = `${sep}data${sep}location${sep}archive${sep}`;
const fileName = `zipInfo.csv`;
const jsonFileName = `zipInfo.json`;
const zipCodeDataLinks = [
  "http://federalgovernmentzipcodes.us/free-zipcode-database-Primary.csv",
  "https://raw.githubusercontent.com/davglass/zipcodes/master/lib/codes.js",
];

const downloadZipCodeData = (
  url: string,
  storeFileTo: string,
  archiveExistingTo: string,
  definitiveFileName: string
) => {
  const importer = new Importer(
    url,
    storeFileTo,
    archiveExistingTo,
    definitiveFileName
  );

  //importer
    //.download()
     Promise.resolve().then(() => mkdir(rootPath + fileLocation))
    .then(() => parseCSV(`${rootPath + fileLocation}`, fileName, jsonFileName));
};

let attemptCount = 0;

const attemptZipCodeImport = () => {
  try {
    console.log("Downloading Zip Codes");
    downloadZipCodeData(
      zipCodeDataLinks[attemptCount],
      fileLocation,
      fileArchiveLocation,
      fileName
    );
  } catch (e) {
    console.error(e);
    attemptCount++;
    if (zipCodeDataLinks[attemptCount]) {
      attemptZipCodeImport();
    } else {
      console.error(
        `Index error zipCodeDataLinks ${attemptCount}
           zip codes have not been downloaded`
      );
    }
  }
};

const parseCSV = async (
  mainDir: string,
  srcFileName: string,
  destFileName: string
) => {
  // initialize csvParser with provided options
  const parser = csvParser({
    delimiter: ",",
    skip_lines_with_error: true,
    columns: true,
    quote: '"',
    cast: true,
    cast_date: true,
  });

  let output = {};

  const src = fs.createReadStream(mainDir + sep + srcFileName, {
    encoding: "utf8",
  });

  const dest = fs.createWriteStream(mainDir + sep + destFileName);

  // / Transform object structure to use zip as Key
  const transformCSV = transformer((data: { [key: string]: any }) => {
    const newObject: { [key: string]: any } = {};
    console.log(data)
    newObject[data["Zipcode"]] = {
      lat: data.Lat,
      long: data.Long,
    };
    return newObject;
  });

  transformCSV.on("data", (chunk) => {
    output = Object.assign({}, output, chunk);
  });

  transformCSV.on("error", (error) => {
    // this is invoked on error
  });

  parser.on("error", (error) => {
    console.log(error);
  });

  src
    .pipe(parser)
    .pipe(transformCSV)
    .on("end", () => {
      dest.write(JSON.stringify(output), (error) => {
        if (error) {
          console.error(error);
        }
      });
    });
};

export default attemptZipCodeImport;
