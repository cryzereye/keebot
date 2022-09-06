const { roles, serverID } = require('../json/config.json');
const dUtil = require('../util/DiscordUtil');
class RoleGiverManager {
  constructor(client){
    this.client = client;
  }

  // cleanup roles from users who managed to get their points reduced and passed below the filters
  async cleanRoleUsers(message, scorer){
    let len = roles.length;
    let role;
    let filter;
    let server = this.client.guilds.resolve(serverID);

    for(let i = 0; i < len; i++){
      console.log("Cleaning " + roles[i].role + "...");
      role = this.getRoleInst(message, roles[i].role);
      filter = roles[i].filter;
      await server.members.fetch(mList => mList.roles.cache.has(id)).catch(console.error);
      guild.roles.cache.get(role.id).members.map(m => {
        console.log(m);
        //if(scorer.getScore(m.id) < filter)
          //  this.rolegiver.removeRoleFromUser(m, message.guild, role);
      })
      console.log("Done cleaning " + roles[i].role + "!!");
    }
  }

  // checks the user if valid for any role
  async roleCheck(userScore, message){
    let len = roles.length;
    for(let i = 0; i < len; i++){
      if(userScore >= roles[i].filter){
        await dUtil.addRoleToUser(message.author, message.guild, this.getRoleInst(message, roles[i].role)).catch(console.error);
      }
    }
  }

  // gives the actual role instance from the server
  getRoleInst(message, roleName){
    return message.guild.roles.cache.find((r) => r.name == roleName);
  }
}

module.exports = { RoleGiverManager }