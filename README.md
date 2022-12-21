# nanogrid_touchscreen

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