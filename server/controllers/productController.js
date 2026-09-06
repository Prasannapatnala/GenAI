const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { generateProductDescription, generateProductDetailsFromImage, generateEmbedding } = require('../services/aiService');
const { Pinecone } = require("@pinecone-database/pinecone");

const collectionName = 'products';
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pinecone.index(process.env.PINECONE_INDEX);

// Helper to get collection
const getCollection = () => getDB().collection(collectionName);

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await getCollection().find(query).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const product = await getCollection().findOne({ _id: new ObjectId(id) });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;

        // Basic Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const newProduct = {
            name,
            description,
            price: Number(price),
            category,
            stock: Number(stock) || 0,
            image: image || '',
            createdAt: new Date()
        };

        const result = await getCollection().insertOne(newProduct);

        // Fetch the created document to return it
        const createdProduct = await getCollection().findOne({ _id: result.insertedId });

        /*
         * We need to create an embedding and upload it to pinecone whenever a new product is added
         */
        // Step 1: Create embed for this product
        const embedding = await generateEmbedding('Product Name: ' + createdProduct.name + ', Product Description: ' + createdProduct.description);

        console.log("Created embedding for product: " + createdProduct.name);

        // Step 2: Upload to pinecone
        // Push this vector to an array
        const vector = {
            id: createdProduct._id.toString(),
            values: embedding,
            metadata: {
                name: createdProduct.name,
                description: createdProduct.description,
                category: createdProduct.category,
                price: createdProduct.price
            }
        };

        await index.upsert([vector]);
        console.log("Successfully uploaded embedding of product: " + createdProduct.name + " to pinecone");

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const updates = { ...req.body };
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        delete updates._id; // Prevent updating ID

        const result = await getCollection().findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!result) { // In newer drivers result might be the document or null, or result.value
            // For mongodb driver v4+, findOneAndUpdate returns a result object. 
            // If using v6, it returns the document directly if includeResultMetadata is false (default).
            // Let's check if we found it.
            const check = await getCollection().findOne({ _id: new ObjectId(id) });
            if (!check) return res.status(404).json({ message: 'Product not found' });
            return res.json(check);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // // Sync with Pinecone
        // try {
        //     await index.deleteOne(id);
        //     console.log("Deleted from pinecone: " + id);
        // } catch (pineconeError) {
        //     console.error("Failed to delete from pinecone:", pineconeError);
        // }

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate product description
// @route   POST /api/products/generate-description
const generateDescription = async (req, res) => {
    try {
        const { name, features } = req.body;
        const description = await generateProductDescription(name, features);
        res.json({ description });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate product details from image
// @route   POST /api/products/generate-details-from-image
const generateDetailsFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        console.log("In generateDetailsFromImage", req.file);
        const details = await generateProductDetailsFromImage(req.file.buffer, req.file.mimetype);
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, error: "This is an error: " + error.message });
    }
};

// @desc    Semantic search using vector embeddings
// @route   GET /api/products/search/semantic
const semanticSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // 1. Generate embedding for query
        const vector = await generateEmbedding(q);

        // 2. Query Pinecone
        const searchResponse = await index.query({
            vector: vector,
            topK: 10,
            includeMetadata: true
        });

        // 3. Extract matches
        const matches = searchResponse.matches || [];

        if (matches.length === 0) {
            return res.json([]);
        }

        // 4. Return results
        // Fetch full product details from MongoDB to ensure we have images etc.
        const ids = matches.map(match => new ObjectId(match.id));
        const products = await getCollection().find({ _id: { $in: ids } }).toArray();

        // Attach scores and maintain order
        const results = products.map(product => {
            const match = matches.find(m => m.id === product._id.toString());
            return {
                ...product,
                score: match ? match.score : 0
            };
        }).sort((a, b) => b.score - a.score); // Re-sort by score

        res.json(results);
    } catch (error) {
        console.error("Semantic Search Error:", error);
        res.status(500).json({ message: 'Semantic search failed', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    generateDescription,
    generateDetailsFromImage,
    semanticSearch
};
