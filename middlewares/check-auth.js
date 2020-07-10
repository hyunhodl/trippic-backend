const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'

        if (!token) {
            throw new Error("인증 실패");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = {
            userId: decodedToken.userId,
            email: decodedToken.email,
        };
        next();
    } catch (error) {
        return next(error);
    }
};
