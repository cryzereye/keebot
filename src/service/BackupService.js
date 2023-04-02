const { state } = require('../json/state.json');
const State = require('../models/State');
const BaseService = require('./BaseService');
const util = require('../util/Utilities');

class BackupService extends BaseService {
    constructor(client) {
        super(client);
        this.startService();
    }

    async startService() {
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
        const src = 'src/json/';
        const dest = `backups/${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;

        util.createFolder('backups');
        util.copyAllFiles(src, dest);
    }

    saveNextBackup(){
        const next = util.addHours(state.next_backup_timedate, 6);
        State.updateState("next_backup_timedate", next.toString());
    }
}

module.exports = { BackupService }