
# ![pepenaruhodo](images/icon.webp)Naruhodo - Keebisoria Vouch Bot
This is the bot that manages the vouching system of the Discord server Keebisoria, a Philippine keyboard market hosted via Discord. 

### Current Features:

- Saves scores for the vouches sent to a specific channel. The vouch sender points increases as he/she/they sends a vouch message with the user that they have transacted with within the server mentioned within the same message. A counterpart point for the mentioned gets added up the him/her/them upon replying to the vouch message where he/she/they got mentioned.
- Contains a stats command where the user can see anyone's stats, containing information like the transaction points, roles, transaction link with other users (based on vouches, with instance count), account creation date, and server join date. This stats serve as basis for the users to check the reliability of the user they want to check and probably transact with.
- Has a report command which users can use to report transaction-related incidents within the server. As of writing this, all discussions are done via DMs. Upon verification of the report, admin/mods can flag the report as verified and a 'verified report count' will be added to the user's stats.
- For admins (me, statically coded from the config), there is a data extraction function that reprocesses all the sent vouches. This is for data accuracy.

All features above will have future additions. Here's our list as of now:

1. Automated buy/sell/trade bumps 
2. Streamlined vouch edits and deletes detection: subject to mod/admin double check
3. Automated vouch verification against actual buy/sell/trade listings
4. Help assistance scoring system
5. Service provider registry and search

For the technical side:

1. Full MongoDB implementation - currently solving async and transaction issues
2. Unit testing implementation - Jest
3. Bot dashboard - probably with React.js for practice
4. Cloud hosting + Docker 

Sample json/config.json:

`
{
  "discord_id": "",
  "discord_token": "",
  "command_sign": "",
  "me_id": "",
  "verifyCHID": "",
  "botCHID": "",
  "testCHID": "",
  "serverID": "",
  "roles": [
    {
      "role": "",
      "filter": #
    }
  ],
  "dev": false,
  "connURI": "",
  "dbname": "",
  "collnames": [
    ""
  ],
  "relevant_roles": [
    "",
    ""
  ],
  "commands": [
    {
      "name": "",
      "type": 1,
      "description": "",
      "options": [
        {
          "name": "",
          "description": "",
          "type": 1,
          "required": false
        }
      ]
    }
  ]
}
`


For donations and tips:
- [Paypal](https://paypal.me/cryzereye)