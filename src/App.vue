<template>
    <body :class=generating>
        <div id="clock">
            <h2 class="date">{{ date }}</h2>
            <h1 class="time">{{ time }}</h1>
            <div><redeem-ioen v-if="redeemPressed" @close="redeem()"></redeem-ioen></div>
            <img src="./Logo200px.gif"/>
            <p>AccruedIOEN: {{ accrued }}</p>
            <button @click="redeem">REDEEM</button>
            <p>MyIOEN: {{ balance }}</p>
            <p> Group Energy: {{ groupEnergy }}</p>
        </div>
    </body>
</template>

<script>
    import axios from 'axios';
    import Web3 from 'web3';

    export default {
            data() {
                return {
                    generating: "bodyconsuming",
                    balance: null,
                    accrued: 0,
                    stakedIoen: 1000,
                    distributionAmount: null,
                    yield: 0.1,
                    date: " ",
                    time: " ",
                    redeemPressed: false,
                    myFronius: {
                        exists:"", 
                        userId: process.env.VUE_APP_FRONIUS_USERID, 
                        password: process.env.VUE_APP_FRONIUS_PASSWORD, 
                        accessKeyId: process.env.VUE_APP_FRONIUS_ACCESS_KEY_ID, 
                        accessKeyValue: process.env.VUE_APP_FRONIUS_ACCESS_KEY_VALUE,
                    }, //this will go to the agents DHT
                    url: 'https://api.solarweb.com/swqapi/iam/jwt',
                    ioenWallet: process.env.VUE_APP_ERC_WALLET,
                    bearer: "",
                    myEnergy: 0,
                    groupEnergy: 1,
                };
            },
            
            created() {
                    var self = this;
    
                    self.froniusjwt(); //get new jwt when loaded
                    setInterval(function() { self.getTime();}, 5000);
                    setInterval(function() { 
                        self.getBalance();
                     }, 10000);
                    setInterval(async function() { 
                        await self.calculatePowerRequirements(); //what is my power requirements. update myEnergy value
                        await self.updateDatabaseValue();//push my value into the database
                        await self.calculateGroupPower();//go through dbase entries and calculate aggregated energy value and update groupEnergy value
                        await self.updateBackground();//update background based on groupEnergy value
                        await self.payments();//make payments if groupEnergy value is balanced.
                    }, 300000); //5 minute intervals
                    setInterval(function() { self.froniusjwt();}, 1800000); //update jwt every 2 hours
                },

            methods: {
                redeem() {  
                    this.redeemPressed = !this.redeemPressed;    
                    console.log("cash out your IOEN");
                    this.accrued = 0;
                },

                getTime() {
                    const datestamp = new Date();
                    var h = datestamp.getHours(); // 0 - 23
                    var m = datestamp.getMinutes(); // 0 - 59
                    var session = "AM";    
                    if(h == 0){
                        h = 12;
                    }
                    if(h > 12){
                        h = h - 12;
                        session = "PM";
                    }      
                    h = (h < 10) ? "0" + h : h;
                    m = (m < 10) ? "0" + m : m;   
                    var time = h + ":" + m + ":" + session;
                    this.date = datestamp.toDateString();
                    this.time = time;
                    // console.log(this.date + " " + this.time);
                },

                async froniusjwt() {

                    var token = "";
                    await axios   // need to await before running this call how do I make it wait for code above to run before running this below run every 15 mins on loop
                     .post('https://api.solarweb.com/swqapi/iam/jwt', {
                         userId: this.myFronius.userId,
                         password: this.myFronius.password,
                     },
                     {
                        headers: {   accept: 'application/json',
                                     AccessKeyId: this.myFronius.accessKeyId,
                                     AccessKeyValue: this.myFronius.accessKeyValue
                                     },
                    })
                    .then(res => {
                        // console.log(`statusCode: ${res.status}`)
                        token = res.data.jwtToken
                    })
                    .catch(error => {
                        console.error(error)
                    });
                    this.bearer = "Bearer " + token;
                },

                async calculatePowerRequirements() {
                    var myRequiredEnergy;
                    var config = {
                        method: 'get',
                        url: 'https://api.solarweb.com/swqapi/pvsystems/ae93ef37-777f-41ec-b289-0c634f0a8e9b/flowdata',
                        headers: { 
                            'accept': 'application/json', 
                            'AccessKeyId': this.myFronius.accessKeyId, 
                            'AccessKeyValue': this.myFronius.accessKeyValue, 
                            'Authorization': this.bearer,
                            // 'Cookie': 'TS01329c72=015bdaa26885819ae3883fac9079973fab3e0f378286b111811e5eb6184cddb3c825e8963d6ec9bd73a8cb6ba71322822b2d10df47; lbc=!szSBRSKIJgrL8YGebLrGiH4EM+a4Dj46J78cza9Z2AQnRYL3soOJSFmaDjffQVVVhKKC2gNlqzbFSirl3r907RpROcC32hFNDNppQVl75Zg='
                        }
                    };
                    
                    await axios(config)
                        .then(function (response) {
                        myRequiredEnergy = parseInt(JSON.stringify(response.data.data.channels[0].value), 10);    
                        })
                        .catch(function (error) {
                        console.log(error);
                        });
                    this.myEnergy = myRequiredEnergy; //update Vue myEnergy data property
                    console.log("from api: " + myRequiredEnergy + " from VUE: " + this.myEnergy);
                },

                async calculateGroupPower() {
                    let groupCalc = 9999;
                    await axios.get('https://nanogrid-25455-default-rtdb.asia-southeast1.firebasedatabase.app/agg_energy.json')
                        .then(function (data) {
                            let ceegee = parseInt(JSON.stringify(data.data.ceegee_energy), 10);
                            let simwilso = parseInt(JSON.stringify(data.data.simwilso_energy), 10);
                            groupCalc = ceegee + simwilso;
                            // console.log(ceegee + " : " + simwilso);
                        });
                    this.groupEnergy = groupCalc;
                    console.log("group calc value is: " + groupCalc);
                    //iterate through individual power values
                    //update aggregated energy value for group
                },

                async getFromDatabase() {
                    var simwilsoEnergy = null;
                    await axios.get('https://nanogrid-25455-default-rtdb.asia-southeast1.firebasedatabase.app/agg_energy.json')
                        .then(data => {
                            simwilsoEnergy = parseInt(JSON.stringify(data.data.simwilso_energy), 10);
                        });
                    this.groupEnergy = simwilsoEnergy;
                },

                async updateDatabaseValue() {
                    await axios.patch('https://nanogrid-25455-default-rtdb.asia-southeast1.firebasedatabase.app/agg_energy.json', {
                        simwilso_energy: this.myEnergy,
                        });
                        console.log("database entry updated to:" + this.myEnergy);
                },

                async updateBackground() {
                    if (this.groupEnergy === 0) {
                         this.generating = "bodyeven"; 
                        // console.log("we are balanced" + this.generating);
                    } else if (this.groupEnergy < 0) {
                        this.generating = "bodygenerating"; 
                        // console.log("we are selling energy" + this.generating);
                    } else {
                        this.generating = "bodyconsuming";
                        // console.log("we are buying eneregy" + this.generating);
                    }
                },

                async getBalance() {
                    // console.log("running balance function");
                    const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/5d1da3b5535842f384c0422aabd2401a'));
                    const balanceOfABI = [
                        {
                            "constant": true,
                            "inputs": [
                                {
                                    "name": "_owner",
                                    "type": "address"
                                }
                            ],
                            "name": "balanceOf",
                            "outputs": [
                                {
                                    "name": "balance",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                   ];
                   const tokenContract = "0x1e4E46b7BF03ECE908c88FF7cC4975560010893A";
                   const tokenHolder = this.ioenWallet;
                   const contract = new web3.eth.Contract(balanceOfABI, tokenContract);
                   let result = await contract.methods.balanceOf(tokenHolder).call();
                   const formattedBalance = web3.utils.fromWei(result, "ether");
                   this.balance = Math.trunc(formattedBalance);
                },

                payments() {
                    if (this.generating === "bodyeven") {
                        this.distributionAmount = this.stakedIoen * this.yield;
                        this.accrued = this.accrued + this.distributionAmount;
                        this.distributionAmount = this.distributionAmount - this.accrued;
                        console.log("youve just been given " + this.distributionAmount + " your IOEN balance is: " + this.accrued);
                    } else {
                        return;
                    }
                },

                payout() {
                    //how much accrued
                    //pay that amount to this user
                    //reset accrued amount to 0
                }

            }
    };
</script>

<style>

html {
  height: 100%;
}

.bodyconsuming {
  height: 100%;
  background: #0f3854;
  background: radial-gradient(ellipse at center, #0a2e38 0%, #041419 70%);
  background-size: 100%;
}

.bodygenerating {
  height: 100%;
  background: #00cc99;
  background: radial-gradient(ellipse at center, #00cc99 0%, #041419 70%);
  background-size: 100%;
}

.bodyeven {
  height: 100%;
  background: #e6cc0a;
  background: radial-gradient(ellipse at center, #e6cc0a 0%, #041419 70%);
  background-size: 100%;
}

p {
  margin: 0;
  padding: 0;
}

#clock {
  font-family: 'Share Tech Mono', monospace;
  color: #ffffff;
  text-align: center;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  color: #daf6ff;
  text-shadow: 0 0 20px #0aafe6, 0 0 20px rgba(10, 175, 230, 0);
}
#clock .time {
  letter-spacing: 0.05em;
  font-size: 80px;
  padding: 5px 0;
}
#clock .date {
  letter-spacing: 0.1em;
  font-size: 24px;
}
#clock .text {
  letter-spacing: 0.1em;
  font-size: 12px;
  padding: 20px 0 0;
}

</style>