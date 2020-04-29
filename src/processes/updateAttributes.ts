
import mongodb from "mongodb"

export default  (collection : mongodb.Collection) => {
    return collection.aggregate([
        {$facet: {
                "Makes": [ 
                    {
                    $group: {
                        "_id": "$Make",
                        "Model Groups": {$addToSet: "$Model Group"}
                    }
                    } 
                ],
                "Models" : [
                    {
                    $group: {
                        "_id": "$Model Group",
                        "ModelDetail": {$addToSet: "$Model Detail"},
                        "Make": {$first: "$Model Detail"}
                    }
                    }
                ],
                "Attributes" : [
                    {
                    $group: {
                        "_id": "Attributes",
                        "Vehicle Type": {$addToSet: "$Vehicle Type"},
                        "Body Style": {$addToSet: "$Body Style"},
                        "Color": {$addToSet: "$Color"},
                        //TODO :  COMPOUND damages keys
                        "damages": {$addToSet: "$Secondary Damage"},
                        "hasKeys": {$addToSet: "$Has Keys-Yes or No"},
                        "lotCondCode": {$addToSet: "$Lot Cond. Code"},
                        "odometerBrand": {$addToSet: "$Odometer Brand"},
                        "Engine": {$addToSet: "$Engine"},
                        "Drive": {$addToSet: "$Drive"},
                        "Transmission": {$addToSet: "$Transmission"},
                        "Fuel Type": {$addToSet: "$Fuel Type"},
                        "Cylinder": {$addToSet: "$Model Detail"},
                        "Runs/Drive": {$addToSet: "$Runs/Drives"},
                        "SaleStatus": {$addToSet: "$Sale Status"},
                        "Make-an-Offer Eligible": {$addToSet: "$Make-an-Offer Eligible"},
                    }
                    }
                ]
            },
        },
        {$addFields: {
                "Attributes": {
                  $arrayElemAt: [
                    "$Attributes",0  
                  ]
                }
            }
        },
        {$out: "test"}
    ],{},(err,result)=>{
        console.log(result)
    })
}

