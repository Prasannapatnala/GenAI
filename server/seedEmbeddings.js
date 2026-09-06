require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { MongoClient } = require("mongodb");

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in environment variables.");
}

const pineconeApiKey = process.env.PINECONE_API_KEY;
if (!pineconeApiKey) {
    console.error("CRITICAL ERROR: PINECONE_API_KEY is not defined in environment variables.");
}

const pineconeIndex = process.env.PINECONE_INDEX;
if (!pineconeIndex) {
    console.error("CRITICAL ERROR: PINECONE_INDEX is not defined in environment variables.");
}

async function main() {

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.index(pineconeIndex);

    // Get all the products from mongodb
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("shopmate");
    const getCollection = () => db.collection("products");
    const products = await getCollection().find({}).toArray();

    const vectors = [];
    // For each product, generate embedding
    for (const product of products) {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: 'Product Name: ' + product.name + ', Product Description: ' + product.description
        });

        console.log("Created embedding for product: " + product.name);

        // Push this vector to an array
        const vector = {
            id: product._id.toString(),
            values: response.embeddings[0].values,
            metadata: {
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price
            }
        };
        vectors.push(vector);
    }

    console.log("Total vectors generated: " + vectors.length);

    // Upload to pinecone
    await index.upsert(vectors);
    console.log("Successfully uploaded embeddings to pinecone");
    await client.close();
}

main();