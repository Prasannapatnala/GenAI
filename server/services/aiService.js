require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenAI } = require("@google/genai");
const { getDB } = require("../config/db");
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!geminiApiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY or GOOGLE_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX;

if (!pineconeApiKey || !pineconeIndexName) {
    console.error("CRITICAL ERROR: PINECONE_API_KEY or PINECONE_INDEX is not defined.");
}

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const index = pinecone.index(pineconeIndexName);

/*
 * Feature 1: Product Description Generation using AI
 * Uses simple text generation.
 */
async function generateProductDescription(productName, category) {
    const prompt = "You are an expert e-commerce copywriter.\n" +
        "Write a catchy, SEO-friendly product description (max " +
        "100 words) for: " + productName + "\n" +
        "Under the category: " + category + "\n" +
        "Tone: Professional yet exciting.";
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,
            maxRetries: 2,
            apiKey: geminiApiKey,
        });
        const result = await model.invoke(prompt);
        const description = result?.content ?? result?.text;
        if (!description) {
            console.warn("AI generated no description result:", result);
            return "Description unavailable";
        }
        return description;
       /* const result = await genAI.models.generateContent(
            {
                model: "gemini-2.5-flash",
                contents: prompt
            });
        return result.text;*/
    } catch (error) {
        console.error("Error generating product description:", error);
        return "Description unavailable";
    }
}

/*
 * Feature 2: Snap & Sell using AI (Multi-modal)
 * Admin uploads product image, AI generates product description, category and filters.
 */
async function generateProductDetailsFromImage(imageBuffer, mimeType) {
    // 1. Define thse schema for strict JSON output
    // 2. Initialize the model (using standard flash model without strict schema for stability)

    console.log("In generateProductDetailsFromImage", imageBuffer, mimeType);
    // 3. Convert Buffer to Generative Part
    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType,
        },
    };

    const prompt = `
        Analyze this product image and extract the details for an e-commerce listing.
        Return ONLY a JSON object with the following properties:
        {
            "name": "A short, catchy product title",
            "description": "A catchy, SEO-friendly product description (max 100 words)",
            "category": "The most appropriate category"
        }
        Do not include markdown formatting like \`\`\`json.
    `;

    try {
        console.log(`Generating details for image. Size: ${imageBuffer.length}, Type: ${mimeType}`);
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        imagePart
                    ]
                }
            ]
        });
        const text = result.text.replace(/```json|```/g, '').trim(); // Clean up markdown if present
        console.log("Gemini Response:", text);
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision Error Full:", error);
        if (error.response) {
            console.error("Vision Error Response:", JSON.stringify(error.response, null, 2));
        }
        throw new Error("Failed to analyze image");
    }
}

/*
 * Feature 3: Semantic Search Embedding Generation
 */
async function generateEmbedding(text) {
    try {
        const result = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text
        });
        return result.embeddings[0].values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

function getPolicyFallbackAnswer(question = "") {
    const normalizedQuestion = (question || "").toLowerCase();

    if (
        normalizedQuestion.includes("refund") ||
        normalizedQuestion.includes("return") ||
        normalizedQuestion.includes("exchange") ||
        normalizedQuestion.includes("damaged") ||
        normalizedQuestion.includes("policy")
    ) {
        return "Our refund policy is simple: you can request a refund or return within 30 days of delivery if the item is unused and in its original packaging. Damaged or incorrect items can be reported within 7 days for a replacement or refund. Refunds are sent back to the original payment method after inspection. If you need help with a specific order, share your order ID and we will guide you.";
    }

    return "I don’t have that specific policy detail in the policy document right now, but you can contact support with your order ID for help.";
}

function extractOrderIdFromQuestion(question = "") {
    const normalizedQuestion = (question || "").trim();

    const directMatch = normalizedQuestion.match(/\b(ORD-[A-Z0-9-]+)\b/i);
    if (directMatch) {
        return directMatch[1].toUpperCase();
    }

    const orderIdMatch = normalizedQuestion.match(/\b(?:order|order id|order number)\s*[:#-]?\s*([A-Z0-9-]+)\b/i);
    if (orderIdMatch) {
        return orderIdMatch[1].toUpperCase();
    }

    return null;
}

function isOrderQuestion(question = "") {
    const normalizedQuestion = (question || "").toLowerCase();
    return (
        normalizedQuestion.includes("order") ||
        normalizedQuestion.includes("orders") ||
        normalizedQuestion.includes("status") ||
        normalizedQuestion.includes("track") ||
        normalizedQuestion.includes("tracking") ||
        normalizedQuestion.includes("delivery") ||
        normalizedQuestion.includes("shipment") ||
        normalizedQuestion.includes("shipped") ||
        normalizedQuestion.includes("delivered") ||
        normalizedQuestion.includes("my order") ||
        normalizedQuestion.includes("my orders") ||
        normalizedQuestion.includes("latest order") ||
        normalizedQuestion.includes("recent order")
    );
}

async function getOrderStatusAnswer(question = "", user = null) {
    const orderId = extractOrderIdFromQuestion(question);
    const asksForGeneralOrder = /\b(?:my|latest|recent|current)\s+(?:order|orders)\b|\b(?:show|find|get|check)\s+(?:my|the)\s+(?:order|orders)\b/i.test(question || "");

    if (!orderId && !asksForGeneralOrder) {
        return "Please share your order ID so I can check the status for you.";
    }

    try {
        const db = getDB();
        let order = null;

        if (orderId) {
            order = await db.collection("orders").findOne({
                orderId: { $regex: new RegExp(`^${orderId}$`, "i") }
            });
        } else {
            const userId = user?.userId || user?.id || user?._id;
            const userIdVariants = [];

            if (userId) {
                const normalizedUserId = String(userId);
                userIdVariants.push({ userId: normalizedUserId });
                userIdVariants.push({ userId: { $regex: new RegExp(normalizedUserId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } });
            }

            const query = userIdVariants.length > 0 ? { $or: userIdVariants } : {};
            order = await db.collection("orders").findOne(query, { sort: { createdAt: -1 } });

            if (!order) {
                order = await db.collection("orders").findOne({}, { sort: { createdAt: -1 } });
            }
        }

        if (!order) {
            return orderId
                ? `I couldn’t find an order with ID ${orderId}. Please double-check it and try again.`
                : "I couldn’t find an order tied to your account right now. Please share your order ID if you want a specific lookup.";
        }

        const items = (order.items || []).map((item) => `${item.quantity} x ${item.name}`).join(", ");
        const deliveredText = order.deliveredAt
            ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}.`
            : "Delivery has not been completed yet.";

        const intro = orderId
            ? `Order ${order.orderId}`
            : `I found your latest order ${order.orderId}`;

        return `${intro} is currently ${order.status}. ${items ? `Items: ${items}.` : ""} ${deliveredText}`;
    } catch (error) {
        console.error("Error looking up order:", error);
        return "I’m having trouble checking that order right now. Please try again in a moment.";
    }
}

/*
 * Feature 4: RAG - Answer Customer Questions about Policy
 */
async function answerCustomerQuestion(question, history = [], user = null) {
    try {
        console.log("Answering question:", question);
        console.log("History depth:", history.length);

        if (isOrderQuestion(question)) {
            return await getOrderStatusAnswer(question, user);
        }

        // 1. Convert question to vector
        const embeddingResult = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: question
        });
        const queryVector = embeddingResult.embeddings[0].values;

        // 2. Search Pinecone for context
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true,
            filter: { type: 'policy' } // Only search policy chunks
        });

        const matches = queryResponse.matches || [];
        if (matches.length === 0) {
            return getPolicyFallbackAnswer(question);
        }

        // 3. Construct Context
        const contextText = matches.map(match => match.metadata.text).join("\n\n---\n\n");

        // Format history
        const historyText = history.map(msg => {
            const role = msg.role === 'user' ? 'Customer' : 'Agent';
            return `${role}: ${msg.content}`;
        }).join("\n");

        // 4. Prompt LLM
        const prompt = `
            You are a helpful customer support agent for ShopMATE.
            Use the following context from our Refund & Returns Policy to answer the customer's question.
            If the answer is not in the context, say "I don't have that information in the policy."
            
            Context:
            ${contextText}

            Conversation History:
            ${historyText}
            
            Customer Question: ${question}
            
            Answer:
        `;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return result.text;

    } catch (error) {
        console.error("Error answering customer question:", error);
        return getPolicyFallbackAnswer(question);
    }
}

module.exports = {
    generateProductDescription,
    generateProductDetailsFromImage,
    generateEmbedding,
    answerCustomerQuestion,
    extractOrderIdFromQuestion,
    isOrderQuestion,
    getOrderStatusAnswer
};
