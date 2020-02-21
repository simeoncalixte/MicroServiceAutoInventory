import { IncomingMessage, ServerResponse, Server } from "http";
import url from "url"



type TRequestCallback =  (req: IncomingMessage, res: ServerResponse, data: any) => any;

interface Method {
    [pathname: string] : {
        callback : TRequestCallback,
        data: {[keys: string] : string }
    }
}

interface IRoutes {
    [method: string] : Method
}

class Router {
    public static routes: IRoutes= {}
    

    public static parseUrl = (method: string, urlString?: string ) => {
        if(!urlString) return
        
        const parsedUrl = url.parse(urlString,true)
        const data = parsedUrl.pathname && Router.getPrettyData(method, decodeURI(parsedUrl.pathname));

       if (data && parsedUrl.pathname){
          parsedUrl.query = Object.assign({}, parsedUrl.query, {...data})
          parsedUrl.pathname = Router.getPathName(parsedUrl.pathname) 
       }
       return parsedUrl;
    }

    public static getPathName = (path : string) => {
        if (path){
            const newPathName = path.match(/\/\w+(?=\/)/);
            return newPathName ? newPathName[0] :  path;
        } 
        return null
    }

    public static handleRequest = (req : IncomingMessage, res: ServerResponse ) => {
        if (req.method){
            const reqInfo =  Router.parseUrl(req.method,req.url);
            console.log(req.method,req.url, reqInfo)
            try{
                if(reqInfo?.pathname){
                    const route = Router.routes[req.method][reqInfo.pathname];
                    route.callback(req,res,reqInfo.query);
                }else{
                    throw new Error("Unable to identify path")
                }
            }
            catch(e){
                // TODO: RETURN ERROR CODES
                console.log(e)
            }
        }
    }

    public static getPrettyData = (method: string, urlString:string) => {
        console.log(urlString)
        let match = urlString.match(/(?<=\/)(((\w+)?(("\w+(\/)?\w+"|-|,|\w+|\s+|\.)+)?)|\w+|\/)/gi)
                    ?.map((string,index)=>{
                        if(index === 0){
                        return  "/" + string
                        }else{
                        return  string.replace(/^\//,"")
                        }
                    });
        
        console.log({match})
        const pathname =  match?.shift();

        if (match && match.length){
            if(pathname &&
                Router.routes[method] &&
                Router.routes[method][pathname] &&
                Router.routes[method][pathname]["data"]
           ){
            const  copiedObject = Object.entries(Router.routes[method][pathname]["data"]);
            match.forEach((item,index)=> {copiedObject[index] ? copiedObject[index][1] = item  : 0;} )
            return Object.fromEntries(copiedObject);;
           }
        }

    }

    public static createRoute = (method: string, pathName: string, callback: TRequestCallback)  => {
        let strip = pathName.match(/(?!\?)(\w+)(?=\:)/gi);
        let newPathName = pathName.match(/\/\w+(?=\/)/);
        let data = {}
        pathName = newPathName && newPathName[0] ? newPathName[0] : pathName;

        if(strip){
            const objectKeys = strip.map((values)=>{
                return [values, null]
            })
            data = Object.fromEntries(objectKeys);
        }

        Router.routes[method] ? 
            Router.routes[method][pathName] = {callback,data} :
            Router.routes[method] = {[pathName]: {callback,data}} ;
    }
}


export default Router