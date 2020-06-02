
import utils from "util";
import fs from "fs";

const mkdir = utils.promisify(fs.mkdir);
const access = utils.promisify(fs.access);

export default async (dir: string) => {
    const check = await access(dir).catch((err)=>{
       console.log("Making Dir", dir)
       return mkdir(dir,{recursive:true})
    })
    return check
}