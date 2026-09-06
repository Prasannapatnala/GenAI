
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'shopmate';

const orders = [
  {
    orderId: 'ORD-1001',
    userId: 'user_alice',
    items: [
      { name: 'Wireless Noise Cancelling Headphones', quantity: 1, price: 299.99 }
    ],
    status: 'delivered',
    deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1002',
    userId: 'user_bob',
    items: [
      { name: 'Mechanical Keyboard', quantity: 1, price: 120.00 },
      { name: 'Minimalist Backpack', quantity: 1, price: 79.00 }
    ],
    status: 'shipped',
    deliveredAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1003',
    userId: 'user_carol',
    items: [
      { name: 'Smart Fitness Watch', quantity: 1, price: 149.50 }
    ],
    status: 'processing',
    deliveredAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1004',
    userId: 'user_alice',
    items: [
      { name: 'Running Shoes', quantity: 1, price: 89.99 }
    ],
    status: 'delivered',
    deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1005',
    userId: 'user_dave',
    items: [
      { name: 'Bluetooth Speaker', quantity: 2, price: 65.00 }
    ],
    status: 'cancelled',
    deliveredAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

const seedOrders = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB for seeding orders...');

    const db = client.db(dbName);
    const collection = db.collection('orders');

    await collection.deleteMany({});
    console.log('Cleared existing orders.');

    const result = await collection.insertMany(orders);
    console.log(`${result.insertedCount} orders added successfully.`);

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
    process.exit();
  }
};

seedOrders();