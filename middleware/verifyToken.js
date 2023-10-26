const jwt = require("jsonwebtoken");

const verify = (permission, crud) => {
    return (req, res, next) => {
        console.log("permission is " + permission);
        try {
            
            const token = req.headers.token
            if (token) {
                jwt.verify(token, "ACCESS_TOKEN_SECRET", (err, decoded) => {
                    if (err) {
                        const refreshToken = req.headers.refreshtoken;
                        if (refreshToken) {
                            jwt.verify(refreshToken, "REFRESH_TOKEN_SECRET", (err, user) => {
                                if (err) {
                                    res.status(403).json("Token is not valid!");
                                }
                                next();
                            });
                        } else {
                            return res.status(401).json("You are not authenticated!");
                            // throw new Error(error)
                        }
                    }
                    else {
                        
                        const userPermission = decoded.permission
                        let checkPermission
                        console.log(userPermission);
                        userPermission.map((tokenPermission)=>{
                            if(tokenPermission.name == permission){
                                checkPermission = crud.every(item => tokenPermission.crud.includes(item))
                                console.log(crud.every(item => tokenPermission.crud.includes(item)))
                            }
                        })
                        

                        // const checkPermission = permission.every(permissionId =>
                        //     userPermission.some(tokenPermission => tokenPermission === permissionId)
                        // )
                        // console.log(checkPermission);
                        if(checkPermission){
                            next()
                        }
                        else{
                            res.status(403).json("permission denied!");
                        }
                    }
                })
            }
            else {
                return res.sendStatus(401).json("You are not authenticated!");
            }
        } catch (error) {
            res.status(400).send(error.message);
        }
    }
}

// const verify = (req, res, next) => {
//     try {
//         const token = req.headers.token
//         if (token) {
//             jwt.verify(token, "ACCESS_TOKEN_SECRET", (err, decoded) => {
//                 if (err) {
//                     const refreshToken = req.headers.refreshtoken;
//                     if (refreshToken) {
//                         jwt.verify(refreshToken, "REFRESH_TOKEN_SECRET", (err, user) => {
//                             if (err) {
//                                 res.status(403).json("Token is not valid!");
//                             }
//                             next();
//                         });
//                     } else {
//                         return res.status(401).json("You are not authenticated!");
//                         // throw new Error(error)
//                     }
//                 }
//                 else {
//                     next()
//                 }
//             })
//         }
//         else {
//             return res.sendStatus(401).json("You are not authenticated!");
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

module.exports = verify;
