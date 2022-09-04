const dUtil = require('../util/DiscordUtil');

class RoleGiver{
  constructor(){}

  // adds given role from given user
  async addRoleToUser(user, guild, role){
    let gm = await dUtil.getGuildMemberfromID(user.id, guild);
    if(gm != null && !(await dUtil.guildMemberHasRole(gm, role))){ // if member already has role, then do not put the role
      gm.roles.add(role).catch((e) => console.log(e.message));
      console.log(role.name + " added from " + user.username);
    }
  }

  // removes given role from given user
  async removeRoleFromUser(user, guild, role){
    let gm = await dUtil.getGuildMemberfromID(user.id, guild);
    if(gm != null && await dUtil.guildMemberHasRole(gm, role)){ // if member already has role, then remove the role
      gm.roles.remove(role).catch((e) => console.log(e.message));
      console.log(role.name + " removed from " + user.username);
    }
  }
}

module.exports = { RoleGiver }