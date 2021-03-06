import React, { Component } from 'react';
import Navbar from './Navbar';
import Main from './Main';
import './App.css';

import Web3 from "web3";
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";
import WalletConnectProvider from "@walletconnect/web3-provider";


class App extends Component {

  constructor( props ) {
    
    super( props );
    
    this.state = {
      userAccount: '',
      userAccountBalance: 0,
      tokenContract: {},
      tokenBalance: '0',
      ethSwapContract: {},
      loading: true
    };
  };
 
  async loadWeb3() {

    if ( window.ethereum ) {
      window.web3 = new Web3( window.ethereum );
      await window.ethereum.enable();
    }

    if ( window.web3 ) {
      window.web3 = new Web3( window.web3.currentProvider );
    }

    if ( !window.web3 ) {
      //  Create WalletConnect Provider
      const provider = new WalletConnectProvider({
        infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
      });

      //  Enable session (triggers QR Code modal)
      await provider.enable();

      
      window.web3 = new Web3(provider);

      // Subscribe to accounts change
      provider.on("accountsChanged", async (accounts) => {
        // fetch user account connected with MetaMask and store in components state
        const userAccounts = await window.web3.eth.getAccounts();
        this.setState( { userAccount: userAccounts[ 0 ] } );
      });
    }
    
    if ( !window.web3 ) {
      alert( window.navigator.userAgent + " is not connected to any blockchain network.");
    }

  };

  async loadBlockchainModule() {

    const { web3 } = window;

    // fetch user account connected with MetaMask and store in components state
    const userAccounts = await web3.eth.getAccounts();
    this.setState( { userAccount: userAccounts[ 0 ] } );

    // fetch user account balance connected with MetaMask and store in components state
    const userAccountBalance = await web3.eth.getBalance( this.state.userAccount );
    this.setState( { userAccountBalance } );

    // instantiate token contract from token abi and store in state
    const tokenAbi = Token.abi;
    const networkId = await web3.eth.net.getId();
    const tokenNetworkObj = Token.networks[ networkId ];

    if ( tokenNetworkObj && Object.keys( tokenNetworkObj ).length ) {
      
      const tokenContract = new web3.eth.Contract( tokenAbi, tokenNetworkObj.address );
      
      this.setState( { tokenContract } );

      const tokenBalance = await tokenContract.methods.balanceOf( this.state.userAccount ).call();

      tokenBalance && this.setState( { tokenBalance: tokenBalance.toString() } );

      console.log( "token balance", this.state.tokenBalance );
    } else {
      alert( `Token contact is not deployed on the connected network at ${ networkId }`);
    }

    // instantiate ethSwap contract from EthSwap abi and store in state
    const ethSwapNetworkObj = EthSwap.networks[ networkId ];

    if ( ethSwapNetworkObj && Object.keys( ethSwapNetworkObj ).length ) {
      
      const ethSwapContract = new web3.eth.Contract( EthSwap.abi, ethSwapNetworkObj.address );
      
      this.setState( { ethSwapContract } );
      // console.log( "ethSwap contract", this.state.ethSwapContract );
    } else {
      alert( `Token contact is not deployed on the connected network at ${ networkId }`);
    }

    this.setState( { loading: false } );
  };

  buyDevTokens = ( equivalentEtherAmt ) => {

    this.setState( { loading: true } );

    console.log( this.state.ethSwapContract );
    this.state.ethSwapContract.methods.buyTokens().send( { value: equivalentEtherAmt, from: this.state.userAccount } ).on( "transactionHash", ( hash ) => {
        console.log( "transaction Hash :: ", hash );

        this.setState( { loading: false } );

        setTimeout(() => {
          this.setState( { loading: false} );
          this.updateBalances();
        }, 2000 );

      });
  };

  sellDevTokens = ( tokensInWei ) => {
    this.state.tokenContract.methods.approve( this.state.ethSwapContract.address, tokensInWei )
                                      .send( { from: this.state.userAccount } )
                                      .on( "transactionHash", ( hash ) => {
                                        this.state.ethSwapContract.methods.sellTokens( tokensInWei )
                                                                          .send( { from: this.state.userAccount } )
                                                                          .on( "transactionHash", ( hash ) => {

                                                                            setTimeout( () => {
                                                                              this.setState( { loading: false} );
                                                                              this.updateBalances();
                                                                            }, 2000 );
                                                                          });
                                      });
  }

  updateBalances = async () => {
    
    // update token balance
    const tokenBalance = await this.state.tokenContract.methods.balanceOf( this.state.userAccount ).call();

    // fetch user account balance connected with MetaMask and store in components state
    const userAccountBalance = await window.web3.eth.getBalance( this.state.userAccount );
    
    this.setState( { 
      tokenBalance: tokenBalance.toString(),
      userAccountBalance } );

  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainModule();
  };
  
  render() {

    const { userAccountBalance, tokenBalance } = this.state;

    let content;

    if ( this.state.loading ) {
      content = <p id='loader' className='text-center'>Loading ...</p>
    }else {
      content = <Main balances={ { userAccountBalance, tokenBalance } } methods={{ buyDevTokens: this.buyDevTokens, sellDevTokens: this.sellDevTokens } } />;
    }


    return (
      <div>
        <Navbar userAccount={ this.state.userAccount }/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto mt-5" style={{ maxWidth: "600px" } }>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                { content }
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
