class RoleGiver{
  constructor(client){
    this.client = client;
  }

  addRoleToUser(user, guild, role){
    guild.members.fetch(user.id).then(
      (m) => {
        m.roles.add(role).catch((e) => console.log(e.message));
        console.log(role.name + " added to " + user.username);
      }).catch(console.error);
  }
}

module.exports = { RoleGiver }