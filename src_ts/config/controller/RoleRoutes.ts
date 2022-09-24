import express from 'express';
import { RoleConfigValidator } from '../validator/RoleConfigValidator';

const router = express.Router();
const validator = new RoleConfigValidator();

router.get('/server/:serverID/role', (req, res) => {
    validator.validateSearchList(req, res);
});

router.get('/server/:serverID/role/:id', (req, res) => {
    validator.validateSearch(req, res);
});

router.post('/server/:serverID/role', (req, res) => {
    validator.validateNew(req, res);
});

router.put('/server/:serverID/role/:id', (req, res) => {
    validator.validateUpdate(req, res);
});

router.delete('/server/:serverID/role/:id', (req, res) => {
    validator.validateDelete(req, res);
});

export default router;