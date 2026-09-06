const{ ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collection = () => getDB().collection('blogs');

async function createBlog({ topic, createdBy }) {
    const now = new Date();
    const doc = {
        topic,
        seoTitle:'',
        metaDescription:'',
        slug:'',
        outline:'',
        draft:'',
        status:'',
        revisionCount:0,
        createdBy:createdBy || null,
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
    };
    const { insertedId } = await collection().insertOne(doc);
    const threadId = insertedId.toString();
    await collection().updateOne({_id:insertedId},{$set: {threadId}});
    return { blogId: threadId, threadId};
}

async function setStatus(blogId, status) {
    await collection().updateOne(
        {_id: new ObjectId(blogId)},
        {$set:{ status,updatedAt: new Date()}}
    );
}

async function getById(blogId){
    return collection().findOne({_id:new ObjectId(blogId)});
}

async function listByStatus(status) {
    const filter = status ? { status }:{};
    return collection().find(filter).sort({updatedAt:-1}).toArray();
}

module.exports = {
    createBlog,
    setStatus,
    getById,
    listByStatus,
};