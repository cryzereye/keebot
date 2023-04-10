
# ![pepenaruhodo](images/icon.webp)**Keebot - A Marketplace-Management Bot**
This is the bot that manages the marketplace system of the Discord server Keebisoria, a Philippine keyboard market hosted via Discord. As of now, this bot is limited to this Discord server but we aim to provide the system globally.

*Support the project via [GCash](https://drive.google.com/file/d/1XZ7shUMq4xmm6v5CtP8X-DTwKGQU6buw/view?usp=share_link) or [Paypal](https://paypal.me/cryzereye)*

## **Market Features**:
`/post new <buy/sell/trade> <optional: itemRole>`
: Handles all post from users including automatic bumps and expiry. Post can be edited/marked as sold/deleted via context menus[^1]. Input validation[^2] is also added.

`/post list <optional:user> <optional: itemRole> <optional:buy/sell/trade>`
: Lists all post given the arguments pased in the command. By default, when no arguments were passed, the list would show all owned post.

`/report file <user> <category> <summary>`
: Users can file reports against other users when an incident happens to their transactions. Once verified by the mods/admin, these reports will be marked as verified and will be counted against the reported users in their record (see `/stats`).

`#verify-transactions`
: Channel that enables users to vouch other users that they transacted with. By mentioning other users, the bot will save points under their record.

`/stats <optional:user>`
: Shows user's stats based on the bot's record from the vouches from #verify-transactions. This' commands' results include roles, vouch points, users they transacted with (max 10 users) including how many instances they got vouched, verified reports count listed by category, account creation dates and duration, user join date and duration in the server. For @Service Providers, they would have a separate count from their service feedbacks.

`/help`
: Shows small information about the bot commands

## **Moderation Features**:
`/report verify <id>`
: Command for verifying reports from users.

`/extract`
: Data correction command for stats record

Admin/mod override for post updates for post cleanup.

## **Back-end Features**:
- Regular data back-up

*Footnotes:*

[^1]: Right click > Apps

[^2]: Valid amount validation based on post type

---
## **Full Typescript Migration On-going**
Development tracking board available here: [Notion kanban board](https://cryzereye.notion.site/b9e4fe70387a4f1a993e5b6d84d04516?v=a54cfda2f01f48a4a854cf9688d0f05e)

Some future features are:

1. Post update scheduling and expiry renewals 
2. Keyword subscription for post notifications
3. Creator channel/stream updates
4. Service Provider registry
5. Microservice architecture via Express.js with TypeScript implementation
6. Full Mongo DB support + queues
7. Unit testing implementation (Jest)
8. Dockerized cloud hosting
9. Bot settings dashboard (Svelte/Next.js)

More are coming. We never run out of ideas ;)