export default class Inventory {
    private url?;
    private mainInventoryCSVDir;
    private archiveInventoryCSVDir;
    private fileName;
    static responseLimit: number;
    constructor(url?: string);
    download: () => void;
    private parseCSV;
    private static createQuery;
    private importInvenotry;
    static getInventory: (queryObject: {
        [key: string]: any;
    }) => Promise<{
        Inventory: {
            totalRecords: number;
            paginationInfo: {
                currentPage: number;
                limit: number;
                lastPage: number;
            };
            data: any[];
        };
    } | undefined>;
}
