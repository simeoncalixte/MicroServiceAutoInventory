/// <reference types="node" />
export default class Inventory {
    private url;
    private mainDir;
    private archiveDir;
    private fileName;
    constructor(url: string, dir: string, archiveDir: string, fileName: string);
    download: () => Promise<import("http").ClientRequest>;
    private beginSavingDataStream;
    private processFile;
    private checkForAndCreateDir;
    private archiveExisting;
}
