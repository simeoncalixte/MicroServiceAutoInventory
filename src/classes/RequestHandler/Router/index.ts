import { IncomingMessage, ServerResponse, Server } from "http";
import { stringify } from "querystring";



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
    public routes: IRoutes= {}
    
    public getPrettyData = (method: string, urlString:string) => {
        const match = (
            urlString.match(/(\/)((\w+|\s)+(((\s+|-|,|=)?(\w)+))+)*/gi)
                ?.map((e,index)=>{
                    return index > 0 ? e.replace("/",""): e;
            })
        );
        const pathname = match?.shift();
        if (match && match.length){
            if(pathname &&
                this.routes[method] &&
                this.routes[method][pathname] &&
                this.routes[method][pathname]["data"]
           ){
            const  copiedObject = Object.entries(this.routes[method][pathname]["data"]);
            match.forEach((item,index)=> {copiedObject[index] ? copiedObject[index][1] = item  : 0;} )
            return Object.fromEntries(copiedObject);;
           }
        }

    }

    public createRoute = (method: string, pathName: string, callback: TRequestCallback)  => {
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

        this.routes[method] ? 
            this.routes[method][pathName] = {callback,data} :
            this.routes[method] = {[pathName]: {callback,data}} ;
    }
}


export default Router