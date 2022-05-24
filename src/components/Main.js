import React, { Component } from "react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
class Main extends Component {

    constructor( props ) {
        super( props );
        this.state = {
            currentForm: 'buy',
            output: 0,
            inputEhtersInWei: 0
        }
    }

    handleOnSubmit = ( event ) => {

        event.preventDefault();
        console.log( this.state.inputEhtersInWei )
        this.props.methods.buyDevTokens( this.state.inputEhtersInWei );
    };

    render() {
      let content
      if( this.state.currentForm === 'buy' ) {
        content = <BuyForm
          userAccountBalance={this.props.balances.userAccountBalance}
          tokenBalance={this.props.balances.tokenBalance}
          buyDevTokens={this.props.methods.buyDevTokens}
        />
      } else {
        content = <SellForm
          userAccountBalance={this.props.balances.userAccountBalance}
          tokenBalance={this.props.balances.tokenBalance}
          sellDevTokens={this.props.methods.sellDevTokens}
        />
      }
      return (
          <div id="content">

            <div className="d-flex justify-content-between mb-3">
              <button
                  className="btn btn-light"
                  onClick={( ) => {
                    this.setState( { currentForm: 'buy' } )
                  }}
                >
                Buy
              </button>
              <span className="text-muted">&lt; &nbsp; &gt;</span>
              <button
                  className="btn btn-light"
                  onClick={( ) => {
                    this.setState( { currentForm: 'sell' } )
                  }}
                >
                Sell
              </button>
            </div>

          <div className="card mb-4" >
  
            <div className="card-body">
              { content }
            </div>
  
          </div>
  
        </div>
      )
    }
};

export default Main;
