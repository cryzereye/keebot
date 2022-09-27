import express from 'express';
import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { ServerConfig } from "../service/ServerConfig";
import { validID, validChannelName, validFilter } from "../utils/Utilities";

export class ServerConfigValidator implements BaseConfigValidator {
    constructor() { }

    validateNew(req: express.Request, res: express.Response) {
        req.json().then( async(reqJSON) => {
            const serverID = "serverID" in reqJSON.body? reqJSON.body.serverID: "";
            const channels = "channels" in reqJSON.body? reqJSON.body.channels: [];
            const roles = "roles" in reqJSON.body? reqJSON.body.roles: [];
            const filters = "filters" in reqJSON.body? reqJSON.body.filters: [];
            if(!validID(serverID)){
                return res.status(400).send('ERROR: Invalid server ID: ' + serverID);
            }

            channels.map(ch => {
                if(!validChannelName(ch.name))
                    return res.status(400).send('ERROR: Invalid channel name: ' + ch.name);
                if(!validID(ch.id))
                    return res.status(400).send('ERROR: Invalid channel ID: ' + ch.id);
            });
            
            roles.map(r => {
                if(!validID(r.id))
                    return res.status(400).send('ERROR: Invalid role ID: ' + r.id);
            });

            filters.map(f => {
                if(!validID(f.id))
                    return res.status(400).send('ERROR: Invalid channel ID: ' + f.id);
                if(!validID(f.role))
                    return res.status(400).send('ERROR: Invalid role ID: ' + f.role);
                if(!validFilter(f.filter))
                    return res.status(400).send('ERROR: Invalid filter ID: ' + f.filter);
            });

            return await res.status(200).send(
                new ServerConfig(serverID, channels, roles, filters)
            );
        });
    }

    validateUpdate(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }

    validateDelete(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }

    validateSearch(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }

    validateSearchList(req: Request, res: Response) {
        throw new Error("Method not implemented.");
    }
}