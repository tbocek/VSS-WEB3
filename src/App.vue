<template>
    <div id="app">
            <!--UPLOAD-->
                <h1>Notarize PDF</h1>
                <div class="dropbox">
                    <input type="file" @change="filesChange($event.target.files);" class="input-file">
                    Drag your file(s) here to begin<br> or click to browse<br>
                    <div v-if="hash !== null">SHA256 Hash: <b>{{hash}}</b></div>
                    <div v-if="fileName !== null">Name: <b>{{fileName}}</b></div>
                    <div v-if="timestamp !== 0"><span id="check">&#10003;</span> VERIFIED at timestamp {{timestamp}}s with account {{web3.eth.defaultAccount}}</div>

                </div>
                <button @click="store()" :disabled="isDisabled">Notarize</button> status: <span v-html="status"></span>
    </div>
</template>

<script>
    const utils = require('./utils.js')
    const Web3 = require('web3');

    export default {
        data: function () {
            return {
                web3: null,
                contract: null,
                hash: null,
                status: 'nothing uploaded',
                isDisabled: true,
                fileName: null,
                timestamp: 0
            }
        },
        created: function () {
            window.addEventListener('load', async () => {
                // Checking if Web3 has been injected by the browser (Mist/MetaMask)
                if (typeof web3 !== 'undefined') {
                    // Use Mist/MetaMask's provider
                    this.web3 = new Web3(Web3.givenProvider);
                    await ethereum.enable();
                    const address = "0xc8adb8c77068315893d3066634e08706b3d5a3d4";
                    this.contract = new this.web3.eth.Contract([{"constant":true,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"verify","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"store","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}], address);
                } else {
                    this.status = 'No web3? You should consider trying MetaMask!'
                }
            })
        },
        methods: {
            filesChange(fileList) {
                const fr = new FileReader();
                fr.onload = async (e) => {
                    this.hash = utils.stringHash(e.target.result);
                    console.log('hash is: '+this.hash)
                    const accounts = await this.web3.eth.getAccounts();
                    this.contract.methods.verify(accounts[0], this.hash).call().then((result, error) => {
                        if(!error) {
                            if(result == 0) {
                                this.isDisabled = false
                                this.timestamp = 0
                                this.status = 'not yet stored from accout: ' + accounts[0]
                            } else {
                                this.isDisabled = true
                                this.timestamp = parseInt(result)
                                this.status = '<b>VERIFIED</b> in the blockchain!'
                            }
                        } else {
                            this.timestamp = 0
                            this.isDisabled = false
                            this.status = 'error: '+error
                        }
                    })
                }
                fr.readAsArrayBuffer(fileList[0]);
                this.fileName = fileList[0].name
            },
            async store() {
                const accounts = await this.web3.eth.getAccounts();
                this.contract.methods.store(this.hash).send({ from: accounts[0]}).then((result, error) => {
                    if(!error) {
                        this.status = 'stored, tx is: '+result.toString()
                    } else {
                        this.status = 'error: '+error;
                    }
                });
                this.timestamp = 0
                this.isDisabled = true
            }
        }
    }
</script>

<style>
    .dropbox {
        outline: 2px dashed grey; /* the dash box */
        outline-offset: -10px;
        background: lightcyan;
        color: dimgray;
        padding: 10px 10px;
        min-height: 200px; /* minimum height */
        position: relative;
        cursor: pointer;
    }

    .input-file {
        opacity: 0; /* invisible but it's there! */
        width: 100%;
        height: 200px;
        position: absolute;
        cursor: pointer;
    }

    .dropbox:hover {
        background: lightblue; /* when mouse over to the drop zone, change color */
    }

    .dropbox p {
        font-size: 1.2em;
        text-align: center;
        padding: 50px 0;
    }

    #check {
        content: "\2713";
        color:green;
        font-size: 2em;
    }
</style>
