import express from 'express';
import { ChannelConfigValidator } from '../validator/ChannelConfigValidator';

const router = express.Router();
const validator = new ChannelConfigValidator();

router.get('/server/:serverID/channel', (req, res) => {
    validator.validateSearchList(req, res);
});

router.get('/server/:serverID/channel/:name', (req, res) => {
    validator.validateSearch(req, res);
});

router.post('/server/:serverID/channel', (req, res) => {
    validator.validateNew(req, res);
});

router.put('/server/:serverID/channel/:name', (req, res) => {
    validator.validateUpdate(req, res);
});

router.delete('/server/:serverID/channel/:name', (req, res) => {
    validator.validateDelete(req, res);
});

export default router;