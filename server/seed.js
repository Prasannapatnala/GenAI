const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'shopmate';

const products = [
    {
        name: "Wireless Noise Cancelling Headphones",
        description: "Experience world-class silence and superior sound with these premium headphones. Features 30-hour battery life and plush ear cushions for all-day comfort.",
        price: 299.99,
        category: "Electronics",
        stock: 50,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
        name: "Ergonomic Office Chair",
        description: "Designed for comfort and productivity. Adjustable lumbar support, breathable mesh back, and smooth-rolling casters.",
        price: 199.99,
        category: "Furniture",
        stock: 20,
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80"
    },
    {
        name: "Smart Fitness Watch",
        description: "Track your health metrics, workouts, and sleep patterns. Water-resistant and features a vibrant AMOLED display.",
        price: 149.50,
        category: "Electronics",
        stock: 100,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
    },
    {
        name: "Minimalist Backpack",
        description: "Sleek and durable backpack perfect for daily commute or travel. Features a padded laptop compartment and water-resistant fabric.",
        price: 79.00,
        category: "Accessories",
        stock: 45,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
    },
    {
        name: "Mechanical Keyboard",
        description: "Tactile and responsive mechanical switches for the ultimate typing experience. RGB backlighting and compact design.",
        price: 120.00,
        category: "Electronics",
        stock: 30,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=800&q=80"
    },
    {
        name: "Ceramic Coffee Mug Set",
        description: "Handcrafted ceramic mugs with a modern matte finish. Microwave and dishwasher safe.",
        price: 35.00,
        category: "Home",
        stock: 60,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"
    },
    {
        name: "Running Shoes",
        description: "Lightweight and breathable running shoes with superior cushioning for impact protection.",
        price: 89.99,
        category: "Clothing",
        stock: 25,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    },
    {
        name: "Bamboo Cutting Board",
        description: "Eco-friendly bamboo cutting board. Durable, knife-friendly, and easy to clean.",
        price: 24.99,
        category: "Home",
        stock: 75,
        image: "https://images.unsplash.com/photo-1626202384357-415848521c7d?w=800&q=80"
    },
    {
        name: "Polarized Sunglasses",
        description: "Classic aviator style sunglasses with polarized lenses to reduce glare and protect your eyes.",
        price: 55.00,
        category: "Accessories",
        stock: 40,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable speaker with powerful bass and 360-degree sound. Waterproof design for outdoor adventures.",
        price: 65.00,
        category: "Electronics",
        stock: 55,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"
    }
];

const seedDB = async () => {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for seeding...');
        const db = client.db(dbName);
        const collection = db.collection('products');

        await collection.deleteMany({}); // Clear existing data
        console.log('Cleared existing products.');

        const result = await collection.insertMany(products);
        console.log(`${result.insertedCount} products added successfully.`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

seedDB();
