<template>
    <body :class="generating ? 'bodygenerating' : 'bodyconsuming'">
        <div id="clock">
            <h2 class="date">{{ date }}</h2>
            <h1 class="time">{{ time }}</h1>
            <div><redeem-ioen v-if="redeemPressed" @close="redeem()"></redeem-ioen></div>
            <img src="./Logo200px.gif"/>
            <p>{{ balance }}</p>
            <p>IOEN</p>
            <button @click="redeem">REDEEM</button>
        </div>
    </body>
</template>

<script>
    import axios from 'axios';
    import Web3 from 'web3';
    export default {
            data() {
                return {
                    generating: false,
                    balance: null,
                    date: " ",
                    time: " ",
                    redeemPressed: false,
                    myFronius: {exists:"", userId:"simon@decentralize.global", password:"High3tt@", accessKeyId:"FKIAAB27DE06AEFF4C14B2F9559FA75CB559", accessKeyValue:"8807d6c0-0a4a-4b9d-b943-e7c1ab3e5627"}, //this will go to the agents DHT
                    url: 'https://api.solarweb.com/swqapi/iam/jwt',
                    bearer: "",
                };
            },
            
            created() {
                    var self = this;
                    setInterval(function() { self.getTime();}, 5000);
                    setInterval(function() { self.froniusjwt();}, 29000);
                    setInterval(function() { self.calculatePowerRequirements(); }, 300000);
                    setInterval(function() { self.getBalance(); }, 10000);
                },

            methods: {
                redeem() {  
                    this.redeemPressed = !this.redeemPressed;    
                    console.log("cash out your IOEN");
                    this.balance = 0;
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
                    //  httpsAgent: new https.Agent({
                        // rejectUnauthorized: false
                        // }),
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
                    // this.generating = !this.generating;  
                    // console.log(this.generating);
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

                    axios(config)
                        .then(function (response) {
                        myRequiredEnergy = JSON.stringify(response.data.data.channels[0].value);    
                        console.log(myRequiredEnergy + "W");
                        // console.log(JSON.stringify(response.data.data.channels[0].value));  //value in W
                        // console.log("from axios:" + myRequiredEnergy);  //value in W
                        })
                        .catch(function (error) {
                        console.log(error);
                        });
                    if (+myRequiredEnergy < 0) {
                        this.generating = true; 
                        console.log("we are selling" + this.generating);
                    } else {
                         this.generating = false; 
                        console.log("we are buying" + this.generating);
                        }
                },

                async getBalance() {
                    console.log("running balance function");
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
                   const tokenHolder = "0xCCCE7DB45b929119d63222B0Be8eD710E289cE37";
                   const contract = new web3.eth.Contract(balanceOfABI, tokenContract);
                   let result = await contract.methods.balanceOf(tokenHolder).call();
                   const formattedBalance = web3.utils.fromWei(result, "ether");
                   this.balance = Math.trunc(formattedBalance);
                   console.log(formattedBalance);
                },
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