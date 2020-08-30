import https from "https";
import http, { IncomingMessage } from "http";
import CSVImporter from "./csvImporter";
import fs from "fs";
import rootPath from "app-root-path";
import mongoClient from "../../database/mongoClient";
import path, { sep } from "path";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Stream } from "stream";
import mkdir from "../../utils/createDirectory";

export default class DataDownloadingManager {
  private url: string = "";
  private mainDir = `${rootPath + sep}`;
  private archiveDir = `${rootPath + sep}archive${sep}`;
  private fileName = ``;

  constructor(url: string, dir: string, archiveDir: string, fileName: string) {
    this.url = url;
    this.mainDir = `${rootPath + sep}${dir}`;
    this.archiveDir = `${rootPath + sep}${archiveDir}`;
    this.fileName = fileName;
  }

  public download = async () => {
    return mkdir(this.mainDir)
      .then(this.archiveExisting)
      .then(this.beginSavingDataStream);
  };

  private beginSavingDataStream = async () => {
    const url = new URL(this.url);
    const config: AxiosRequestConfig = {
      responseType: "stream",
    };

    return axios
      .get(this.url, config)
      .then(this.processFile)
      .catch((e) => console.log(e));
  };

  private processFile = (res: AxiosResponse<Stream>) => {
    const stream = res.data;
    stream.on("data", (chunk) => {
      console.log("data");
      fs.appendFileSync(this.mainDir + this.fileName, chunk);
    });
    return new Promise((res) => {
      stream.on("end", (data: any) => {
        res("done");
      });
    });
  };

  private archiveExisting = async () => {
    return await mkdir(this.archiveDir).then(async () => {
      const fileNameInfo = path.parse(this.fileName);
      const mainFile = this.mainDir + this.fileName;
      const archivedFile =
        this.archiveDir +
        `${fileNameInfo.name}_${Date.now()}${fileNameInfo.ext}`;
      fs.exists(mainFile, (exist) => {
        if (exist) {
          fs.copyFileSync(mainFile, archivedFile);
          fs.unlinkSync(this.mainDir + this.fileName);
        }
      });
    });
  };
}
