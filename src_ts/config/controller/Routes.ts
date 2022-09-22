const { app } = require('../index');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/server', (req, res) => {
    
});

app.get('/server/:serverID', (req, res) => {
    
});

app.get('/server/:serverID/channel', (req, res) => {
    
});

app.get('/server/:serverID/channel/:channel', (req, res) => {
    
});

app.get('/server/:serverID/channel', (req, res) => {
    
});

app.get('/server/:serverID/channel/:channel', (req, res) => {
    
});

app.get('/server/:serverID/role', (req, res) => {
    
});

app.get('/server/:serverID/filter', (req, res) => {
    
});

app.get('/server/:serverID/filter/:role', (req, res) => {
    
});