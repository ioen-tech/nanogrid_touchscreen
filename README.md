# our project

as chatted on the call. This code is a very simple webapp version of the solution.
there is no enrollment, process etc but it does have the api calls and basis for what I want us to build.

for our first version we will create a mobile native application (using likely vue capacitor application.
our app will allow a user to:
- register as a user
- include their fronius credentials in the registration process (so the app can query their fronius system via api).
- create an 'energy group' or join an existing group.
- add a logo for their energy group
once setup and part of an energy group
- the app queries their fronius every 5 minutes
- the value is either a + - or 0.  For each interval the value of all users in the group is added up and added to a dbase
- if the sum of all user values is within 500w of 0 the screen glows a colour or shows an animation and a reward is given to everyone in the group
- we send a notification to each user daily to say how much reward they have earned.
- if the interval sum value for the group is outside of that range the in app screen glows a different colour to indicate their group is consuming or producing too much energy

in our first work we will just do the above with database for the group number and to keep group lists and members and all else with local/hosted vue js code.

but once we have the ux setup our next sprint will replace the dbase with Holochain DHT to manage user credentials, groups/group members, group available reward balance for distribution, and individual user reward balance.

after we have done that we will implement some Ethereum Smart contract code into the setup as the rewards here are IOEN tokens which are ethereum based.
ill describe the goal for that once we get going RC but essentially the main part of of the agent balance and reward available will be in Holochain but we will have to create a smart contract in ethereum for each energy group that will mirror that from holochain and allow a user to swap.
Ill explain better and try draw this once we get going.

as mentioned my objective is to have 50 users on this initial setup that will be really close friends and family type people so that's our first goal.

Ill setup a new repo for this new app and will copy this readme to it.
I think first thing will be to look at this code and look into capacitor and then you and i grab a call and plan how we can start building it.

# this repo and app: nanogrid_touchscreen

This is a mobile friendly app and game where the goal is to form a group with friends and/or local neighbours that acheives a balanced grid (neither consuming or producing excess electricity) which is the goal of any grid.

* The game starts with a pool of IOEN Tokens which are deposited and used as rewards/prize for the group.
* A group of users form a team and can add/remove users from it.
* The game monitors user members electricity meters at 5 minute intervals.
* For every 5 minute interval it adds up all the members values and determines if the group is producing, consuming, or balanced.
* For the interval that status is logged and the users app/device glows in a colour to reflect the status
* At the end of each hour the application determines what proportion of the time the group achieved 'balanced grid'
* IOEN tokens from the pool are distributed to member users based on their performance and shown in the users IOEN wallet on the app.

App UI is written in VUE JS.
Backend leverages:
  1) JS calls to user meter solution API
  2) Holochain DHT for aggregated group interval state (balanced/consuming/producing and a number)
  3) Ethereum via RAIN for; user wallet, group staking contract, automatic IOEN ERC distributions every hour)
 all above will use NODE JS

# User Stories TODO

- user enrollment:
  - as a user I can register to the mobile app and create a new ethereum wallet for myself through the interface enrollment process
  - once created the VUE app shows my Eth and IOEN balance
  - I can send some ethereum to my wallet and my balance is updated to reflect
  - as a user on enrollment I enter the credentials for my Fronius, Tesla meter and the app provides a connected/not connected indicator.
 
- new group creation:
  - as group creator I can create a new (energy group) with a name and reward multiplier specified
  - my user wallet is allocated as the group owner
  - I click a create button and the app backend creates a new staking contract on Ethereum mainnet
  - Details of the balance IOEN and ETH in the new contract is displayed in my app dashboard
  - Anyone can add IOEN tokens and Eth to that contract and as owner I can withdraw those tokens if needed.

- sign up users to my group
  - as a user of the app can join an energy group by entering the contract address of that group
  - anyone who is in a group sees a list of group members with a flag indicating who is the 'owner/admin' for that group.
  - the IOEN and Eth balance for my group is shown in the app
  - my own IOEN wallet balance is shown in the app
  - i can only be a member of 1 group at a time.

- calculate energy 
  - the application host (NPM) will query each user in a group every 5 minutes and 'sum' all the values.
  - the 'sum' value as well as a status (balanced/consuming/producing) is published to a Holochain DHT for that group

- distribute rewards
  - every hour the application host (NPM) will work out how many of the intervals had a 'balanced' status.
  - the app will distribute IOEN to member wallets based on how many intervals with distribution weighting.

## capability

initial working nanogrid for touchscreen design and fronius integration.
capabilities:

- functional clock
- background colour changes when producing or generating electricity
- connects to fronius solar inverter for signals
- connects and gets IOEN balance from a configured wallet
- has a redeem button that currently only implements a popup

## Get your users FRONIUS Credentials
Need to apply for API Key on solar.web for this.

## The user needs a wallet that has IOEN in it.
Get the address of their IOEN wallet.

## Add a .env file and details first
Add .env file with following credentials:

``
ERC_WALLET=xxx //erc user wallet address: 
FRONIUS_USERID=xxx@xxx//fronius userId:
FRONIUS_PASSWORD=xxx//fronius password:
FRONIUS_ACCESS_KEY_ID=xxx//fronius accessKeyId:
FRONIUS_ACCESS_KEY_VALUE=xxx//fronius accessKeyValue:
VUE_APP_FRONIUS_DEVICE_ID=https://api.solarweb.com/swqapi/pvsystems/<YOUR DEVICE ID>/flowdata

ENERGY_GROUP_DHT=""//user energy group dht TODO
``
NOTE: <user will need to apply for REST API Access.  YOUR DEVICE ID is found in the solar.web URL portal.

DONE:
- update with another colour for background so 3 options (consume, generate, balance)
- as a user I can add my inverter details to a .env file and they come from there.
- add accrued IOEN data
- create a redeem function in nanogrid that withdraws 'accrued' amount of IOEN from a web3 wallet.
- reset the accrued value to 0
- create function iterating through energy values and calculates aggregate of all subscribers.

TODO:

- research rain protocol for staking and payment distributions

LATER TODO:

- create node instance for ceegee fronius
- create a staking smart contract to hold IOEN
- enable other applications so touchscreen is useful in van (spotify, netflix, iheartradio)
- add solaredge api support
- add tesla api support
- add tuya api support

IOEN DISTRIBUTION WORKFLOW

-run holochain node instance on nanogrid
-create wallet for nanogrid
-add group oracle NUMBER for agents



- User stakes IOEN into staking contract for 4 months
- IOEN Offers +40% matched collateral for an Energy User Group on Total Staked value
- Group will get a % of that collateral based on the % of time their group stay within balanced category

- each 5 minutes the energy usage from all group users is aggregated in a DHT
- that aggregation produces a number + - or 0 for that timeslot (Var=GroupEnergyValue)
- depending on the number the code inserts a value into an array producing, consuming, balanced. (Array=HourlyPerformanceTable) 
- each hour the code reviews the array and computes portion of time in balanced as a number 0.X (Var=HourlyPerformanceValue)
- collateral * max for that hour is multiplied by 0.X number. (Var=HourlyPayoutVal)
- payout to wallet
