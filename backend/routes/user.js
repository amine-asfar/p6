const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
//on a utilisee methode post parece que le fronend va envoyer email et password
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


//exporter router pour importer dans app.js
module.exports = router;

