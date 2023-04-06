const { channelsID } = require('../../json/config.json');
const dUtil = require('../util/DiscordUtil');

export class StatsManager {
    constructor(client){
        this.client = client;
    }

    async correctStatsData(interaction, scorer, rolegivermngr){
        let vouchChannel = dUtil.getChannelFromID(guild, channelsID.verify);

    }
}