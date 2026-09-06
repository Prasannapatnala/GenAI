require("dotenv").config();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require("@pinecone-database/pinecone");

const geminiApiKey = process.env.GEMINI_API_KEY;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndex = process.env.PINECONE_INDEX;

if (!geminiApiKey || !pineconeApiKey || !pineconeIndex) {
    console.error("Missing API keys or Index name in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const pc = new Pinecone({ apiKey: pineconeApiKey });
const index = pc.index(pineconeIndex);

// Helper to chunk text
function chunkText(text, size = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.substring(i, i + size));
    }
    return chunks;
}

async function ingest() {
    try {
        let policyText = "";

        // Try PDF first
        const pdfPath = path.join(__dirname, 'Refund_Policy.pdf');
        if (fs.existsSync(pdfPath)) {
            console.log("Found Refund_Policy.pdf, parsing...");
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            policyText = data.text;
        } else {
            // Try TXT
            const txtPath = path.join(__dirname, 'Refund_Policy.txt');
            if (fs.existsSync(txtPath)) {
                console.log("Refund_Policy.pdf not found, checking for Refund_Policy.txt...");
                console.log("Found Refund_Policy.txt, reading...");
                policyText = fs.readFileSync(txtPath, 'utf-8');
            } else {
                throw new Error("No Refund_Policy.pdf or Refund_Policy.txt found in server directory.");
            }
        }

        if (!policyText.trim()) {
            throw new Error("Policy text is empty.");
        }

        console.log(`Policy text length: ${policyText.length} characters.`);

        const chunks = chunkText(policyText);
        console.log(`Split into ${chunks.length} chunks.`);

        const vectors = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embeddingResult = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: chunk
            });

            const vector = {
                id: `policy_chunk_${i}`,
                values: embeddingResult.embeddings[0].values,
                metadata: {
                    type: 'policy',
                    text: chunk,
                    timestamp: new Date().toISOString()
                }
            };
            vectors.push(vector);
            console.log(`Generated embedding for chunk ${i + 1}/${chunks.length}`);
        }

        // Batch upload
        await index.upsert(vectors);
        console.log("Successfully ingested policy embeddings into Pinecone.");

    } catch (error) {
        console.error("Ingestion failed:", error);
        process.exit(1);
    }
}

ingest();
