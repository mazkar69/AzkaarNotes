import  jwt from "jsonwebtoken";
import User from "../models/user-authantication/user.model.js";



// const asyncHandler = require("express-async-handler");

const protect = (async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {

        try {
      
            token = req.headers.authorization.split(" ")[1];
    
            const key = process.env.JWT_SECRET;
    
            var decoded = jwt.verify(token, key);

            req.user = await User.findById(decoded._id).select("-password");
            if (req.user) {
                
                next();
            }
            else {

                res.status(401).json({ "success": false, "msg": "Unauthorized user" });
            }
            // console.log(req.user)
        } catch (error) {
            res.status(401).json({ "success": false, "msg": "Unauthorized user" });
        }
    }

    if (!token) {
        res.status(401).json({ "success": false, "msg": "Unauthorized user" });
    }
});

export default protect;