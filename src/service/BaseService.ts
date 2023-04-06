class BaseService {
    constructor(client) {
        this.client = client;
    }

    async startService() {}
}

module.exports = BaseService;