import { IncomingMessage, ServerResponse } from "http";
import Router from "./Router"
import url from "url"

interface UrlWithParsedQuery extends url.UrlWithParsedQuery{
}
export default class RequestHandler {  
    public router = new Router
    public urlInfo :  UrlWithParsedQuery | null = null
    
    constructor ( ){
        return this;
    }

    /**
     * parses the url from a pretty url (i.e /example/product/type)
     */
    public parseUrl = (method: string, urlString?: string ) => {
        if(!urlString) return
        
        this.urlInfo = url.parse(urlString,true)
        const data = this.urlInfo.pathname && this.router.getPrettyData(method, decodeURI(this.urlInfo.pathname));
              
        if (data) this.urlInfo.query = Object.assign({}, this.urlInfo.query, {...data})
        this.urlInfo.pathname = this.getPathName();
    }

    public getPathName = ( ) => {
        if (this.urlInfo && this.urlInfo.pathname){
            const newPathName = this.urlInfo.pathname.match(/\/\w+(?=\/)/);
            return newPathName ? newPathName[0] :  this.urlInfo.pathname;
        } 
        return null
    }

    public handleRequest = (req : IncomingMessage, res: ServerResponse ) => {
        req.method && req.url && this.parseUrl(req.method,req.url);
        if (req.method && this.urlInfo && this.urlInfo.pathname){
            try{
                const route = this.router.routes[req.method][this.urlInfo.pathname];
                route.callback(req,res,this.urlInfo.query);
            }
            catch(e){
                // TODO: RETURN ERROR CODES
                console.log(e)
            }
        }
    }


}