const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({status: false, message: "Token is not valid!"});
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json({status: false, message: "You are not authenticated!"});
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "Player" || req.user.role === "Admin" || req.user.role === "Coach" || req.user.role === "Physiotherapist") {
            next();
        } else {
            res.status(403).json({status: false, message: "You are not allowed to do that!"});
        }
    })
}

const verifyPlayer = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "Player" || req.user.role === "Admin") {
            next();
        } else {
            res.status(403).json({status: false, message: "You are not allowed to do that!"});
        }
    })
}

const verifyCoach = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "Coach" || req.user.role === "Admin") {
            next();
        } else {
            res.status(403).json({status: false, message: "You are not allowed to do that!"});
        }
    })
}

const verifyPhysiotherapist = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "Physiotherapist" || req.user.role === "Admin") {
            next();
        } else {
            res.status(403).json({status: false, message: "You are not allowed to do that!"});
        }
    })
}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "Admin") {
            next();
        } else {
            res.status(403).json({status: false, message: "You are not allowed to do that!"});
        }
    })
}

module.exports = {
    verifyToken, verifyTokenAndAuthorization, verifyPlayer, verifyCoach, verifyPhysiotherapist, verifyAdmin
};