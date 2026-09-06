const test = require('node:test');
const assert = require('node:assert/strict');
const { isOrderQuestion, extractOrderIdFromQuestion } = require('../services/aiService');

test('recognizes my order phrasing as an order question', () => {
  assert.equal(isOrderQuestion('show my order'), true);
  assert.equal(isOrderQuestion('what is the status of my orders'), true);
  assert.equal(isOrderQuestion('where is my latest order'), true);
});

test('extracts explicit order IDs from questions', () => {
  assert.equal(extractOrderIdFromQuestion('check order ORD-1001'), 'ORD-1001');
  assert.equal(extractOrderIdFromQuestion('order number: ord-2002'), 'ORD-2002');
});
