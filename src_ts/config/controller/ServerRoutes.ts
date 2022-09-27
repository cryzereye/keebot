const express = require('express');
import { ServerConfigValidator } from '../validator/ServerConfigValidator';

const router = express.Router();
const validator = new ServerConfigValidator();

router.get('/server', (req, res) => {
    validator.validateSearchList(req, res);
});

router.get('/server/:serverID', (req, res) => {
    validator.validateSearch(req, res);
});

router.post('/server/', (req, res) => {
    validator.validateNew(req, res);
});

router.put('/server/:serverID', (req, res) => {
    validator.validateUpdate(req, res);
});

router.delete('/server/:serverID', (req, res) => {
    validator.validateDelete(req, res);
});

export default router;