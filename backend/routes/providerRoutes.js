const express = require('express');
const router = express.Router();
const { getProviders, getProviderById } = require('../controllers/providerController');

router.get('/', getProviders);
router.get('/:id', getProviderById);

module.exports = router;
