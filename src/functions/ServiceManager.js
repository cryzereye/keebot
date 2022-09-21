const { channelsID, dev } = require('../json/config.json');
const { location, type } = require('../globals/service.json');

class ServiceManager {
  constructor(client) {
    this.client = client;
  }

  buildCommands(commands) {
    location.map( loc => {
      commands[9].options[0].options[0].choices.push({
        name: loc,
        description: loc,
        value: loc
      });

      commands[9].options[1].options[0].choices.push({
        name: loc,
        description: loc,
        value: loc
      });

    });

    type.map( type => {
      commands[9].options[0].options[1].choices.push({
        name: type,
        description: type,
        value: type
      });

      commands[9].options[1].options[1].choices.push({
        name: type,
        description: type,
        value: type
      });
    });

    
    return commands;
  }

  processCommand(interaction){

  }
}

module.exports = { ServiceManager };