
import mongodb from "mongodb"

declare function emit(key: any, value?: any ): any 
const projectKeyValues = {
    keyValues: {$objectToArray: "$$CURRENT"}
}

interface IMap {
    _id: string
}
const mapFunction1 = ( ) => {
    // @ts-ignore
    const [_id, ...rest] = this;
    emit(_id, rest)
}
const reduceFunction1 = (key: any, value: any ) => {
    // @ts-ignore
    return {key,value};
}



export default  (collection : mongodb.Collection) => {
    let index = 0;
    collection.mapReduce(
        mapFunction1,
        reduceFunction1,
        {out: {inline: 1}}
    )
}

