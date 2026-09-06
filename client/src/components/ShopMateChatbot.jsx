import React from 'react';
import ChatBot from 'react-chatbotify';
import api from '../utils/api';

const ShopMateChatbot = () => {
    // Track conversation history
    const historyRef = React.useRef([]);

    // 1. Define the API call handler
    const fetchPolicyAnswer = async (params) => {
        try {
            const userQuestion = params.userInput;

            // Add user message to history
            historyRef.current.push({ role: 'user', content: userQuestion });

            const response = await api.post('/ai/ask-policy', {
                question: userQuestion,
                history: historyRef.current,
            });

            const botAnswer = response.data.answer || "I couldn't find a policy answer for that question right now.";

            // Add bot answer to history
            historyRef.current.push({ role: 'model', content: botAnswer });

            return botAnswer;
        } catch (error) {
            console.error("Chatbot API Error:", error);
            return "I apologize, but I'm having trouble accessing the policy right now. Please try again later.";
        }
    }

    // 2. Define the flow
    const flow = {
        start: {
            message: "Hi! I'm your ShopMATE policy assistant. How can I help you with returns or refunds today?",
            path: "loop"
        },
        loop: {
            message: fetchPolicyAnswer,
            path: "loop"
        }
    };

    return (
        <ChatBot flow={flow} />
    );
};

export default ShopMateChatbot;
