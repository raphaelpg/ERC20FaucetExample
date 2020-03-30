const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const ERC20FaucetExample = artifacts.require("ERC20FaucetExample");

contract("ERC20FaucetExample", function(accounts){
    const owner = accounts[0];
    const spender = accounts[1];
    const _name = "MyFaucetExample";
    const _symbol = "MFE";
    const _decimals = 18;
    const _totalSupply = 1000000;

    //Before each unit test  
    beforeEach(async function() {
        this.ERC20FaucetExampleInstance = await ERC20FaucetExample.new(_name, _symbol, _decimals, _totalSupply);
    });

    //Testing ERC20 metadata
    //Test 1
    it("Check token name", async function() {
        expect(await this.ERC20FaucetExampleInstance.name.call()).to.equal("MyFaucetExample");
    });

    //Test 2
    it("Check token symbol", async function() {
        expect(await this.ERC20FaucetExampleInstance.symbol.call()).to.equal("MFE");
    });

    //Test 3
    it("Check token decimals", async function() {
        expect(await this.ERC20FaucetExampleInstance.decimals.call()).to.be.bignumber.equal(new BN(18));
    });

    //Testing ERC20 fonctions
    //Test 4
    it('Check totalSupply() function', async function () {
        let totalSupply = await this.ERC20FaucetExampleInstance.totalSupply();
        expect(totalSupply).to.be.bignumber.equal(new BN(1000000));
    });

    //Test 5
    it("Check balanceOf() function", async function () {
        let balanceOf = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        expect(balanceOf).to.be.bignumber.equal(new BN(1000000));
    });

    //Test 6
    it("Check transfer() function", async function () {
        let ownerBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        let amount = new BN('10');

        await this.ERC20FaucetExampleInstance.transfer(spender, amount, {from: owner});

        let ownerBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(amount));
    });

    //Test 7
    it("Check approve() and allowance() functions", async function () {
        let amount = new BN('10');
        await this.ERC20FaucetExampleInstance.approve(spender, amount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(amount);
    });

    //Test 8
    it("Check transferFrom() function", async function () {
        let ownerBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        let amount = new BN('10');

        await this.ERC20FaucetExampleInstance.approve(spender, amount, {from: owner});

        await this.ERC20FaucetExampleInstance.transferFrom(owner, spender, amount, {from: spender});

        let ownerBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(amount));
    });

    //Test 9
    it("Check increaseAllowance() function", async function () {
        let initialAmount = new BN('10');
        let addedAmount = new BN('5');
        await this.ERC20FaucetExampleInstance.approve(spender, initialAmount, {from: owner});
        await this.ERC20FaucetExampleInstance.increaseAllowance(spender, addedAmount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(initialAmount.add(addedAmount));
    });

    //Test 10
    it("Check decreaseAllowance() function", async function () {
        let initialAmount = new BN('10');
        let subtractedAmount = new BN('5');
        await this.ERC20FaucetExampleInstance.approve(spender, initialAmount, {from: owner});
        await this.ERC20FaucetExampleInstance.decreaseAllowance(spender, subtractedAmount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(initialAmount.sub(subtractedAmount));
    });


    //Testing Ownable fonctions
    //Test 11
    it('Check owner() function', async function () {
        let currentOwner = await this.ERC20FaucetExampleInstance.owner();
        expect(currentOwner).to.be.equal(owner);
    });

    //Test 12
    it('Check isOwner() function', async function () {
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: owner});
        expect(isOwner).to.be.equal(true);
    });

    //Test 13
    it('Check renounceOwnership() function', async function () {
        await this.ERC20FaucetExampleInstance.renounceOwnership({from: owner});
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: owner});
        expect(isOwner).to.be.equal(false);
    })

    //Test 14
    it('Check transferOwnership() function', async function () {
        await this.ERC20FaucetExampleInstance.transferOwnership(spender, {from: owner});
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: spender});
        expect(isOwner).to.be.equal(true);
    })

    //Test 15
    it('Check onlyOwner() modifier', async function () {
        await expectRevert(this.ERC20FaucetExampleInstance.transferOwnership(spender, {from: spender}),"Ownable: caller is not the owner");
    })


    //Testing token smart contract function
    //Test 16
    it('Check getTokens() function', async function () {
        await this.ERC20FaucetExampleInstance.getTokens(20, {from: spender});
        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        expect(spenderBalanceAfter).to.be.bignumber.equal(new BN(20));
        
        let totalSupplyAfter = await this.ERC20FaucetExampleInstance.totalSupply();
        expect(totalSupplyAfter).to.be.bignumber.equal(new BN(_totalSupply + 20));

        await expectRevert(this.ERC20FaucetExampleInstance.getTokens(1, {from: spender}),"Function can be called every two minutes, wait");
    })
});