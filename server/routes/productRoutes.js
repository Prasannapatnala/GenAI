const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    generateDescription,
    generateDetailsFromImage,
    semanticSearch
} = require('../controllers/productController');

const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');

router.get('/search/semantic', semanticSearch);

router.route('/')
    .get(authenticate,authorizeRoles(['admin', 'user']), getProducts)
    .post(authenticate,authorizeRoles(['admin']), createProduct);

router.route('/:id')
    .get(authenticate,authorizeRoles(['admin', 'user']), getProductById)
    .put(authenticate,authorizeRoles(['admin']), updateProduct)
    .delete(authenticate,authorizeRoles(['admin']),     deleteProduct);

router.post("/generate-description", generateDescription);

// --- Middleware Configuration ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.route('/generate-details-from-image')
    .post(upload.single('image'), generateDetailsFromImage);

module.exports = router;
