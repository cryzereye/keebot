import { StateRepository } from "../repository/StateRepository.js";
import { Service } from "./Service.js";

export class BackupService extends Service {
    repo: StateRepository;

    constructor() {
        super();
        this.repo = new StateRepository();
        this.startService();
    }

    async startService() {
        while (true) {
            if (this.isTime()) this.doBackup();
            this.saveNextBackup();

            // every 3 hours
            await new Promise(resolve => setTimeout(resolve, UTIL.getMinutes(6 * 60)));
        }
    }

    /**
     * returns True if now is a valid time to do backup
     * @returns {boolean}
     */
    isTime() {
        const time = this.repo.find("next_backup_timedate");
        return (new Date() >= (time ? <Date>time.value : new Date()));
    }

    doBackup() {
        const now = new Date();
        const src = 'json/';
        const dest = `backups/${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;

        UTIL.createFolder('backups');
        UTIL.copyAllFiles(src, dest);
    }

    saveNextBackup() {
        const time = this.repo.find("next_backup_timedate");
        const next = UTIL.addHours((time ? <Date>time.value : new Date()), 6);
        this.repo.update("next_backup_timedate", next);
    }
}