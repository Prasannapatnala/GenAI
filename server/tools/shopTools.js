const { tool } = require('@langchain/core/tools');
const {z} = require('zod');
const {getDB} = require('../config/db');
const {Pinecone} = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../services/aiService');

const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY});
const index = pinecone.index(process.env.PINECONE_INDEX);

async function checkOrderStatusFunction({orderId}) {
    try{
        const db = getDB();
        const order = await db.collection('orders').findOne({orderId});
        if(!order){
            return `No order found with ID ${orderId}`;
        }
        const itemList = order.items.map(item => `${item.quantity} x ${item.name}`).join(', ');
        return(
            `Order ID: ${order.orderId} contains : ${itemList} ,'+'Current status: ${order.status},`
        );
    } catch(err){
        return `Could not lookup order ${orderId}: ${err.message}`;
    }   
}

const chechOrderStatusTool = tool(checkOrderStatusFunction,{
    name: "check_order_status",
    description: "Check the status of an order by providing the order ID",
    schema: z.object({
        orderId: z.string().describe("The unique identifier of the order to check")
    }),
});

async function searchProductsFunction({query}){
    try{
        const vector = await generateEmbedding(query);

        const response = await index.query({
            vector,
            topK:3,
            includeMetadata:true,
        });
        const matches = response.matches || [];
        if (matches.length === 0){
            return "No products found matching that description.";
        }
        const results = matches.map((match,i) => {
            const meta = match.metadata || {};
            return `${i+1}. ${meta.name} - $${meta.price}`;
        }).join('\n');
        return `Here are the closest matching products:\n${results}`;
    }
    catch(err){
        return `product search failed: ${err.message}`;
    }
}

const searchProductsTool = tool(searchProductsFunction,{
    name: "search_products",
    description: 'Search the ShopMate product catalog using a natural language description.'+
    'Use this when the customer asks whether a product is available'+
    'or wants product recommendations.',
    schema: z.object({
        query: z.string()
        .describe(
            'A natural language description of what the customer is looking for,'+
            'for example "wireless headphones" or "running shoes".'
        ),
    }),
});
/*
async function getRefundPolicyFunction({question}){
    try{
        const vector = await generateEmbedding(question);
        const response = await index.query({
            vector,
            topK:2,
            includeMetadata:true,
            filter:{type:'policy'},
        });
        const matches = response.matches || [];
        if (matches.length === 0){
            return "No refund policy found matching that description.";
        }
        const policyText = matches
        .map((match) => match.metadata.text)
        .join('\n\n');

        return `Relevant policy information:\n\n${policyText}`;
    }
    catch(err){
        return `couldnot retrieve policy: ${err.message}`;
    }
}
*/

async function getRefundPolicyFunction({ question }) {
    try {
        console.log("=== REFUND TOOL CALLED ===");
        console.log("Question:", question);

        const vector = await generateEmbedding(question);

        const response = await index.query({
            vector,
            topK: 2,
            includeMetadata: true,
            filter: { type: 'policy' },
        });

        console.log(
            "PINECONE RESPONSE:",
            JSON.stringify(response, null, 2)
        );

        const matches = response.matches || [];

        console.log("MATCH COUNT:", matches.length);

        if (matches.length === 0) {
            return "No refund policy found matching that description.";
        }

        const policyText = matches
            .map(match => match.metadata?.text)
            .join('\n\n');

        return `Relevant policy information:\n\n${policyText}`;
    } catch (err) {
        console.error(err);
        return `could not retrieve policy: ${err.message}`;
    }
}

const getRefundPolicyTool = tool(getRefundPolicyFunction,{
    name: "get_refund_policy",
    description: 
    'Retrieve the relevant section of the ShopMate refund  and return policy.'+
    'Use this when the customer asks about refunds, returns, exchanges, or damage items.',
    schema: z.object({
        question: z.string()
        .describe(
            'The customer question about refunds, or returns,'+
            'for example "Can I return a damaged item?" '+
            'or "How many days do i have to return?"'
        ),
    }),
});

module.exports = {chechOrderStatusTool, searchProductsTool, getRefundPolicyTool};