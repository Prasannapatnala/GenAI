const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const aiService = require('../services/aiService');

const getUserFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, 'access_secret_key');
    } catch (error) {
        return null;
    }
};

// POST /api/ai/ask-policy
router.post('/ask-policy', async (req, res) => {
    try {
        const { question, history, message } = req.body;
        const userQuestion = question || message;

        if (!userQuestion) {
            return res.status(400).json({ error: "Question is required" });
        }

        console.log("Question:", userQuestion);
        console.log("History:", history);
        const user = getUserFromRequest(req);
        const answer = await aiService.answerCustomerQuestion(userQuestion, history || [], user);
        res.json({ answer });
    } catch (error) {
        console.error("Error in /ask-policy:", error);
        res.status(500).json({ error: "Failed to process question" });
    }
});

router.post('/agent', async (req, res) => {
    try {
        const { message, question, history } = req.body;
        const userQuestion = question || message;

        if (!userQuestion) {
            return res.status(400).json({ error: "Message is required" });
        }

        const user = getUserFromRequest(req);
        const answer = await aiService.answerCustomerQuestion(userQuestion, history || [], user);
        res.json({ answer });
    } catch (error) {
        console.error("Error in /agent:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
});


module.exports = router;
