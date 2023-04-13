import * as Service from "./Service.js";

import { state } from '../../json/state.json';
import * as State from '../models/State.js';
import * as util from '../util/Utilities.js';

export class BackupService extends Service.Service {
    constructor() {
        super();
        this.startService();
    }

    override async startService() {
        while (true) {
            if (this.isTime()) this.doBackup();
            this.saveNextBackup();

            // every 3 hours
            await new Promise(resolve => setTimeout(resolve, util.getMinutes(6 * 60)));
        }
    }

    /**
     * returns True if now is a valid time to do backup
     * @returns {boolean}
     */
    isTime() {
        return (new Date() >= new Date(state.next_backup_timedate));
    }

    doBackup() {
        const now = new Date();
        const src = 'json/';
        const dest = `backups/${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;

        util.createFolder('backups');
        util.copyAllFiles(src, dest);
    }

    saveNextBackup() {
        const next = util.addHours(state.next_backup_timedate, 6);
        State.next_backup_timedate(next.toString());
    }
}