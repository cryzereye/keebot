import { ServerConfig } from "../service/ServerConfig";

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

    /**
     * adds a new set of server config. should be called upon bot join
     * @param { ServerConfig } data 
     */
    addNewServerConfig(data: ServerConfig): void {
        this.config.findOneAndUpdate(
            { serverID: data.serverID },
            {
                serverID: data.serverID,
                channels: data.channels,
                roles: data.roles,
                filter: data.filters
            },
            {
                upsert: true
            }
        ).catch(console.error);
    }

    getServerConfig(serverID: string) {
        return this.config.findOne(
            { serverID: serverID },
        ).catch(console.error);
    }

}