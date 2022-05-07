// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Token.sol";

contract EthSwap {
   string public name = "EthSwap Instant Exchange";
   Token public token;
   uint public rate = 100;

   event TokensPurchased(
      address investorAccount,
      address tokenAccount,
      address exchangeAccount,
      uint exchangedTokens,
      uint rate
   );

   event TokensSold(
      address investorAccount,
      address tokenAccount,
      address exchangeAccount,
      uint exchangedTokens,
      uint rate
   );

   constructor( Token _token ) {
      token = _token;
   }

   function buyTokens() public payable {

      // Amount of ethereum * redemption rate
      uint exchangedTokens = msg.value * rate;

      // check if the exchange has enough tokens to swap
      // exchange should have tokens greater than or equal to tokens which are to be exchanged
      require( token.balanceOf( address( this ) ) >= exchangedTokens );
      
      // transfers token to investors account.
      token.transfer( msg.sender, exchangedTokens );

      // Emit an event on successful purchase of token
      emit TokensPurchased( msg.sender, address( token ), address( this ), exchangedTokens, rate );
   }

   function sellTokens( uint tokens ) public {
      
      // one shouldn't be allowed to sell tokens more than they have
      require( token.balanceOf( msg.sender ) >= tokens );
      
      // evaluate eather amount corresponding to the no of tokens the seller wants to sell.
      uint etherAmount = tokens / rate;

      // check if the exchange has enough ethers to swap
      // exchange should have ether greater than or equal to ethers which are to be exchanged
      require( address( this ).balance >= etherAmount );

      // move the tokens to ethSwap exchange balance
      token.transferFrom( msg.sender, address( this ), tokens );

      // transfer etherAmount to sellers account
      payable( msg.sender ).transfer( etherAmount );

      // Emit an event on successful sell of tokens
      emit TokensPurchased( msg.sender, address( token ), address( this ), tokens, rate );

   }
}