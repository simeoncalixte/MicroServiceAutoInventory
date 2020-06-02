/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import url from "url";
declare type TRequestCallback = (req: IncomingMessage, res: ServerResponse, data: any) => any;
interface Method {
    [pathname: string]: {
        callback: TRequestCallback;
        data: {
            [keys: string]: string;
        };
    };
}
interface IRoutes {
    [method: string]: Method;
}
declare class Router {
    static routes: IRoutes;
    static parseUrl: (method: string, urlString?: string | undefined) => url.UrlWithParsedQuery | undefined;
    static getPathName: (path: string) => string | null;
    static handleRequest: (req: IncomingMessage, res: ServerResponse) => void;
    static getPrettyData: (method: string, urlString: string) => {
        [x: string]: string;
        [x: number]: string;
    } | undefined;
    static createRoute: (method: string, pathName: string, callback: TRequestCallback) => void;
}
export default Router;
