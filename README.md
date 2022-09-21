
# ![pepenaruhodo](images/icon.webp)Keebot - A Marketplace-Management Bot
This is the bot that manages the marketplace system of the Discord server Keebisoria, a Philippine keyboard market hosted via Discord. As of now, this bot is limited to this Discord server but we aim to provide the system globally.

### Current Features:

- Has marketplace features available. The users can send a bot command to post either an item for the configured buy/sell/trade channels. It can also edit, delete, and mark it as sold. There is also a command for listing the target user's posts and/or an item that is under a certain category. The bot also bumps the posts in a set interval. This is the post visibility.
- Saves scores for the vouches sent to a specific channel. The vouch sender points increases as he/she/they sends a vouch message with the user that they have transacted with within the server mentioned within the same message. A counterpart point for the mentioned gets added up the him/her/them upon replying to the vouch message where he/she/they got mentioned.
- Contains a stats command where the user can see anyone's stats, containing information like the transaction points, roles, transaction link with other users (based on vouches, with instance count), account creation date, and server join date. This stats serve as basis for the users to check the reliability of the user they want to check and probably transact with.
- Has a report command which users can use to report transaction-related incidents within the server. As of writing this, all discussions are done via DMs. Upon verification of the report, admin/mods can flag the report as verified and a 'verified report count' will be added to the user's stats.
- For admins (me, statically coded from the config), there is a data extraction function that reprocesses all the sent vouches. This is for data accuracy.

All features above will have future additions. Here's our list as of now:

1. Streamlined vouch edits and deletes detection: subject to mod/admin double check
2. Automated vouch verification against actual buy/sell/trade listings
3. Help assistance scoring system
4. Service provider registry and search

For the technical side:

1. Full MongoDB implementation - currently solving async and transaction issues
2. Unit testing implementation - Jest
3. Bot dashboard - probably with React.js for practice
4. Cloud hosting + Docker 

For donations and tips:
- [Paypal](https://paypal.me/cryzereye)