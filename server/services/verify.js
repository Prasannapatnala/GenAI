/*const jwt = require('jsonwebtoken');
const {getDB} = require('../config/db');

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = getDB();
        await db.collection('users').updateOne(
            {email: decoded.email},
           
            { $set: { isVerified: true,verifiedAt: new Date() } }
        );
        res.redirect("http://localhost:3000/login?verified=true");
    } catch (error) {
       res.redirect("http://localhost:5173/login?error=Invalid%20or%20expired%20verification%20link");
    }
};

module.exports = { verifyEmail };
*/
/*
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const db = getDB();

        await db.collection('users').updateOne(
            { _id: new ObjectId(decoded.userId) },
            { 
                $set: { 
                    isVerified: true,
                    verifiedAt: new Date()
                } 
            }
        );

        return res.redirect("http://localhost:5173/login?verified=true");

    } catch (error) {
        return res.redirect("http://localhost:5173/login?error=Invalid%20or%20expired%20verification%20link");
    }
};

module.exports = { verifyEmail };
*/
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const db = getDB();

        await db.collection('users').updateOne(
            {
                _id: new ObjectId(decoded.userId)
            },
            {
                $set: {
                    isVerified: true,
                    verifiedAt: new Date()
                }
            }
        );

        return res.redirect(
            "http://localhost:5173/login?verified=true"
        );

    } catch (error) {
        console.error(error);

        return res.redirect(
            "http://localhost:5173/login?error=Invalid%20or%20expired%20verification%20link"
        );
    }
};

module.exports = { verifyEmail };