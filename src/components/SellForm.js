import React, { Component } from "react";
import tokenLogo from "../token-logo.png";
import ethLogo from "../eth-logo.png";

class SellForm extends Component {

    constructor( props ) {
        super( props );
        this.state = {
            output: 0,
            inputTokensInWei: 0
        }
    }

    handleOnSubmit = ( event ) => {

        event.preventDefault();
        this.props.sellDevTokens( this.state.inputTokensInWei );
    };

    render() {
        return (
            <form className="mb-3" onSubmit={this.handleOnSubmit}>
                <div>
                  <label className="float-left"><b>Input</b></label>
                  <span className="float-right text-muted">
                    Balance:
                    {window.web3.utils.fromWei( this.props.tokenBalance, 'Ether' ) }
                  </span>
                </div>
                <div className="input-group mb-4">
                  <input
                    type="text"
                    onChange={(event) => {

                        if ( event.target.value === '' ) {
                            return this.setState( {
                                output: 0,
                                inputTokensInWei: 0
                            })
                        }

                        if ( !event.target.value.match( /(^-?[0-9.]+)/ ) ) {
                            alert( "Please enter numbers only." );
                            event.target.value = '';
                            return;
                        }

                        const tokenAmount = event.target.value.toString()
                        this.setState({
                            output: tokenAmount / 100,
                            inputTokensInWei: window.web3.utils.toWei( tokenAmount, 'Ether' )
                        }, 
                            // () => console.log( this.state.output );
                        )
                    }}
                    className="form-control form-control-lg"
                    placeholder="0"
                    required />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <img src={tokenLogo} height='32' alt=""/>
                          &nbsp;&nbsp;DApp
                    </div>
                  </div>
                </div>
                <div>
                  <label className="float-left"><b>Output</b></label>
                  <span className="float-right text-muted">
                    Balance: 
                    {window.web3.utils.fromWei( this.props.userAccountBalance, 'Ether' )}                    
                  </span>
                </div>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="0"
                    value={ this.state.output }
                    disabled
                  />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <img src={ethLogo} height='32' alt=""/>
                      &nbsp;&nbsp;ETH
                    </div>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="float-left text-muted">Exchange Rate</span>
                  <span className="float-right text-muted">1 ETH = 100 DApp</span>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">SWAP!</button>
              </form>
        )
    }
};

export default SellForm;
