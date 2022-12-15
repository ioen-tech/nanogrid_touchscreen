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

ENERGY_GROUP_DHT=""//user energy group dht
``


DONE:
- update with another colour for background so 3 options (consume, generate, balance)
- as a user I can add my inverter details to a .env file and they come from there.

TODO:

- create and link with holochain dht for energy group 'net usage'
- create a backend service that distributes IOEN to configured wallets in nanogrid.
- create a backend service that allows a user to deposit IOEN to 'staking' wallet
- enable other applications so touchscreen is useful in van (spotify, netflix, iheartradio)

LATER TODO:

- add solaredge api support
- add tesla api support
- add tuya api support