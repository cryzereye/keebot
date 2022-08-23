class RoleGiver{
  constructor(){}

  // adds given role from given user
  async addRoleToUser(user, guild, role){
    let gm = await this.fetchUser(user, guild);
    if(gm != null && !this.hasRole(gm, role)){ // if member already has role, then do not put the role
      gm.roles.add(role).catch((e) => console.log(e.message));
      console.log(role.name + " added from " + user.username);
    }
  }

  // removes given role from given user
  async removeRoleFromUser(user, guild, role){
    let gm = await this.fetchUser(user, guild);
    if(gm != null && this.hasRole(gm, role)){ // if member already has role, then remove the role
      gm.roles.remove(role).catch((e) => console.log(e.message));
      console.log(role.name + " removed from " + user.username);
    }
  }
  
  // checks if given GuildMember has the given Role
  hasRole(guildmember, role){
    if(guildmember !== undefined && role !== undefined) {
      if(guildmember.roles.cache.find(r => r.name === role.name) != undefined)
        return true;
    }
    return false;
  }

  // gets the GuildMember equivalent from given User
  async fetchUser(user, guild){
    return guild.members.fetch(user.id).then((m) => {
      return m;
    }).catch(console.error);
  }
}

module.exports = { RoleGiver }