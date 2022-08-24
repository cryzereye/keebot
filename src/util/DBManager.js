const { MongoClient } = require('mongodb');
const { connURI} = require('../json/config.json');
class DBManager {
    constructor(){
        this.dbclient = new MongoClient(connURI);
        if(await client.connect()){
            console.log("MongoDB connected!");
        }
    }
}