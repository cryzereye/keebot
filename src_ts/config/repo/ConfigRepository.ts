import { ConfigType } from "../model/enums/ConfigType";

const { MongoClient, Collection } = require('mongodb');
const { connURI } = require('../../secrets');

export class ConfigRepository {
    dbclient: typeof MongoClient;
    config: typeof Collection;

    constructor() {
        this.dbclient = new MongoClient(connURI);

        console.log("Connecting to database...");
        this.dbclient.connect((err, db) => {
            this.config = db.db('vouchbot').collection('config');
            console.log("Connected to config!");
        }).catch(console.error);
    }

    addConfig(serverID: string, data: Object){
        
    }


}