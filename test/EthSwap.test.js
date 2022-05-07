const { assert } = require("chai");

/*global artifacts*/
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require( "chai" )
    .use( require( "chai-as-promised" ) )
    .should() // assertion type

function convertEtherToWei( number ) {
    // eslint-disable-next-line no-undef
    return web3.utils.toWei( number, "ether" );
};

function getEtheriumBalanceOf( address ) {
    // eslint-disable-next-line no-undef
    return web3.eth.getBalance( address );
};

// eslint-disable-next-line no-undef
contract( "EthSwap :: ", async ( [ deployer, investor ] ) => {

    let tokenInstance, ethSwapInstance;
    // eslint-disable-next-line no-undef
    before(async () => {

        tokenInstance = await Token.new();
        ethSwapInstance = await EthSwap.new( tokenInstance.address );
        
        await tokenInstance.transfer( ethSwapInstance.address, convertEtherToWei( "1000000" ) );
    })
    
    describe( "Testing token deployment :: " , async () => {
        it( "Contract should have a name!", async () => {
    
            // const tokenInstance = await Token.new();

            const name = await tokenInstance.name();
    
            assert.equal( name, "Dev Token" );
        });
    });

    describe( "Testing ethSwap deployment ::" , async () => {

        it( "Contract should have a name!", async () => {
            
            // const ethSwapInstance = await EthSwap.new();
            
            const name = await ethSwapInstance.name();
    
            assert.equal( name, "EthSwap Instant Exchange" );
        });

        it( "Contract should have tokens!", async () => {

            const balance = await tokenInstance.balanceOf( ethSwapInstance.address );
    
            assert.equal( balance.toString() , "1000000000000000000000000" );
        });
    });

    describe( "Buy Dev tokens :: ", async () => {
        
        let tokensBoughtResult;
        
        // eslint-disable-next-line no-undef
        before( async () => {
            tokensBoughtResult = await ethSwapInstance.buyTokens( {
                from: investor,
                value: convertEtherToWei( "1" ) // 1 Ether = 100 Dev Tokens
            }); 
        });

        it( "Spend ether to buy Dev tokens!", async () => {
            // check for investor's token balance
            let investorBalanceInWei = await tokenInstance.balanceOf( investor );

            // investor will have 100 tokens in Wei as paid amount is 1 Ether
            assert.equal( investorBalanceInWei.toString(), convertEtherToWei( "100" ) );

            let ethSwapInstanceBalanceInWei;
            // check ethSwapInstance's token balance
            ethSwapInstanceBalanceInWei = await tokenInstance.balanceOf( ethSwapInstance.address );
            
            // exchange will have 100 tokens in Wei less than 1000000 tokens in Wei i.e 999900 tokens in Wei
            assert.equal( ethSwapInstanceBalanceInWei.toString(), convertEtherToWei( "999900" ) );
            
            // check for ethSwapInstance etherium balance
            ethSwapInstanceBalanceInWei = await getEtheriumBalanceOf( ethSwapInstance.address );

            // exhange will have 1 Etherium in balance assuming this was the first transaction
            assert.equal( ethSwapInstanceBalanceInWei.toString(), convertEtherToWei( "1" ) );

            const eventArgs = tokensBoughtResult.logs[0].args; 
            assert.equal( eventArgs.investorAccount, investor );
            assert.equal( eventArgs.tokenAccount, tokenInstance.address );
            assert.equal( eventArgs.exchangeAccount, ethSwapInstance.address );
            assert.equal( eventArgs.exchangedTokens.toString(), convertEtherToWei( "100" ).toString() );
            assert.equal( eventArgs.rate.toString(), "100" );
        });
    });

    describe( "Sell Dev tokens :: ", async () => {
        
        let tokensSoldResult;
        
        // eslint-disable-next-line no-undef
        before( async () => {

            // approval from investor is required to transfer tokens from investors account to exchange
            await tokenInstance.approve( ethSwapInstance.address, convertEtherToWei( "100" ), { from: investor } );

            tokensSoldResult = await ethSwapInstance.sellTokens( convertEtherToWei( "100" ), {
                from: investor
            });
        });

        it( "Spend tokens to get Ether back! ", async () => {
            // check for investor's token balance
            let investorBalanceInWei = await tokenInstance.balanceOf( investor );

            // investor will have 0 Dev tokens in Wei as sold tokens count is 100 Dev tokens
            assert.equal( investorBalanceInWei.toString(), convertEtherToWei( "0" ) );

            let ethSwapInstanceBalanceInWei;
            // check ethSwapInstance's token balance
            ethSwapInstanceBalanceInWei = await tokenInstance.balanceOf( ethSwapInstance.address );
            
            // exchange will have equal to 1000000 tokens in Wei as 100 tokens were added to it
            assert.equal( ethSwapInstanceBalanceInWei.toString(), convertEtherToWei( "1000000" ) );
            
            // check for ethSwapInstance etherium balance
            ethSwapInstanceBalanceInWei = await getEtheriumBalanceOf( ethSwapInstance.address );

            // exhange will have 1 Etherium in balance assuming this was the first transaction
            assert.equal( ethSwapInstanceBalanceInWei.toString(), convertEtherToWei( "0" ) );

            const eventArgs = tokensSoldResult.logs[0].args; 
            assert.equal( eventArgs.investorAccount, investor );
            assert.equal( eventArgs.tokenAccount, tokenInstance.address );
            assert.equal( eventArgs.exchangeAccount, ethSwapInstance.address );
            assert.equal( eventArgs.exchangedTokens.toString(), convertEtherToWei( "100" ).toString() );
            assert.equal( eventArgs.rate.toString(), "100" );

            // FAILIURE: investor can't sell more tokens than they have
            await ethSwapInstance.sellTokens( convertEtherToWei( "500" ), { from: investor } ).should.be.rejected;
        });
    });
});

