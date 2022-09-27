const express = require('express');
import { FilterConfigValidator } from '../validator/FilterConfigValidator';

const router = express.Router();
const validator = new FilterConfigValidator();

router.get('/server/:serverID/filter', (req, res) => {
    validator.validateSearchList(req, res);
});

router.get('/server/:serverID/filter/:id', (req, res) => {
    validator.validateSearch(req, res);
});

router.post('/server/:serverID/filter', (req, res) => {
    validator.validateNew(req, res);
});

router.put('/server/:serverID/filter/:id', (req, res) => {
    validator.validateUpdate(req, res);
});

router.delete('/server/:serverID/filter/:id', (req, res) => {
    validator.validateDelete(req, res);
});

export default router;