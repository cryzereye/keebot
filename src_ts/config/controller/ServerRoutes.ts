import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/server', (req, res) => {
    
});

router.get('/server/:serverID', (req, res) => {
    
});

router.post('/server/', (req, res) => {});

export default router;