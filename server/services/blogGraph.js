
require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');
const{
    StateGraph,
    Annotation,
    START,
    END,
    MemorySaver,
    Command,
    interrupt,
} = require('@langchain/langgraph');
const{ObjectId} = require('mongodb');
const {getDB} = require('../config/db');

const blogApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!blogApiKey) {
    console.error('CRITICAL ERROR: GEMINI_API_KEY or GOOGLE_API_KEY is not defined for blog generation.');
}
const genAI = new GoogleGenAI({ apiKey: blogApiKey });

function parseJson(text){
    try{
        return JSON.parse(text.replace(/```json|```/g,'').trim());
    }catch{
        return null;
    }
}


const BlogState = Annotation.Root({
    topic:Annotation(),
    outline:Annotation(),
    draft:Annotation(),
    seoTitle:Annotation(),
    metaDescription:Annotation(),
    slug:Annotation(),
    feedback:Annotation(),
    status:Annotation(),
    blogId:Annotation(),
    revisionCount:Annotation(),
    decision:Annotation(),
});

async function outlineNode(state){
    const prompt = 
    'You are an SEO content stategist for ShopMate, an e-commerce store.\n'+
    `write a structured blog outline for the topic "${state.topic}" .\n`+
    'use markdown with H2/H3 headings and a one-line note under eacg heading.\n'+
    'Return ONLY the outline markdown, nothing else.';

    const result = await genAI.models.generateContent({
        model:'gemini-2.5-flash',
        contents:prompt
    });

    const outline = ((result.text || result.content) ?? '').trim();
    if(!outline)
        throw new Error('Outline generation returned an empty response');
    return {outline};
}

async function draftNode(state){
    const humanFeeedback = Boolean(state.feedback);
    const prompt = 
    'You are an SEO content writer for ShopMate, an e-commerce store.\n'+
    `Topic: "${state.topic}"\n\n`+
    `Outline:\n${state.outline}\n\n`+
    (humanFeeedback
        ?`Revise tour PREVIOUS draft to address the user's feedback.\n`+
        `previous draft:\n${state.draft}\n\n user feedback:\n${state.feedback}\n\n`
    :'')+
    'write the full blog post in markdown, naturally usinf the target keywords.\n'+
    'Return ONLY a JSON object (no markdown fences) with:\n'+
    '{\n'+
    ' "seoTitle": "An SEO-optimized title(<=60 chars)",\n'+
    ' "metaDescription": "An SEO-optimized meta description(<=155 chars)",\n'+
    ' "slug": "A URL-friendly slug for the blog post",\n'+
    ' "Content": "The full blog post content in markdown"\n'+
    '}';

    const result = await genAI.models.generateContent({
        model:'gemini-2.5-flash',
        contents:prompt
    });
    const parsed = parseJson((result.text || result.content) ?? '') || {};
    const draft = parsed.Content || '';
    const seoTitle = parsed.seoTitle || state.topic;
    const metaDescription = parsed.metaDescription || '';
    const slug = parsed.slug || state.topic.toLowerCase().replace(/\s+/g, '-');

    return{
        draft,
        seoTitle,
        metaDescription,
        slug,
        revisionCount: (state.revisionCount || 0) + 1,
    };
}

async function saveDraftNode(state){
    const db = getDB();
    await db.collection('blogs').updateOne(
        {_id: new ObjectId(state.blogId)},
        {
            $set:{
                outline: state.outline,
                draft: state.draft,
                seoTitle: state.seoTitle,
                metaDescription: state.metaDescription,
                slug: state.slug,
                status: 'in_review',
                revisionCount: state.revisionCount,
                updatedAt: new Date(),
            }
        }
    );
    return {status:'in_review'};
}

async function reviewNode(state){
    const decision = interrupt({
        type:'review',
        blogId: state.blogId,
        outline: state.outline,
        draft: state.draft,
        revisionCount: state.revisionCount,
    });
    if(decision && decision.action == 'approve'){
        return {status:'approved', decision:'approve'};
    }
    return{
        decision:'reject',
        feedback:(decision && decision.feedback) || '',
        status:'draft',
    };
}

async function publishNode(state){
    const now = new Date();
    await getDB().collection('blogs').updateOne(
        {_id: new ObjectId(state.blogId)},
        {$set:{status:'published', publishedAt:now, updatedAt:now}}
    );
    return {status:'published'};
}


function routeAfterReview(state){
    return state.decision === 'approve' ? 'approve' : 'reject';
}

const graph = new StateGraph(BlogState)
    .addNode('outline_node', outlineNode)
    .addNode('draft_node', draftNode)
    .addNode('save_draft', saveDraftNode)
    .addNode('review', reviewNode)
    .addNode('publish', publishNode)
    .addEdge(START, 'outline_node')
    .addEdge('outline_node', 'draft_node')
    .addEdge('draft_node', 'save_draft')
    .addEdge('save_draft', 'review')
    .addConditionalEdges('review', routeAfterReview, {
        approve:'publish',
        reject:'draft_node',
    })
    .addEdge('publish', END)
    .compile({checkpointer: new MemorySaver()});

async function startRun(threadId, input){
    return graph.invoke(
        input,
        {configurable: {thread_id: threadId}}
    );
}

async function resumeRun(threadId, input){
    return graph.invoke(
        new Command({resume: input}),
        {configurable: {thread_id: threadId}}
    );
}

module.exports = {startRun, resumeRun };