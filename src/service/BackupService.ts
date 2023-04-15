import { Service } from "./Service.js";

export class BackupService extends Service {
    constructor() {
        super();
        this.startService();
    }

    async startService() {
        while (true) {
            this.doBackup();

            // every 6 hours
            await new Promise(resolve => setTimeout(resolve, UTIL.getMinutes(6 * 60)));
        }
    }

    doBackup() {
        const now = new Date();
        const src = 'json/';
        const dest = `backups/${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;

        UTIL.createFolder('backups');
        UTIL.copyAllFiles(src, dest);
    }
}