const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const ERC20FaucetExample = artifacts.require("ERC20FaucetExample");

contract("ERC20FaucetExample", function(accounts){
    const owner = accounts[0];
    const spender = accounts[1];
    const address0 = '0x0000000000000000000000000000000000000000';
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
        console.log("Testing ERC20 metadata:");
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


    //Testing ERC20 basic functions
    //Test 4
    it('Check totalSupply() function', async function () {
        console.log("Testing ERC20 basic functions:");
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

        //`recipient` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.transfer(address0, amount, {from: owner}),"ERC20: transfer to the zero address");        
        //the caller must have a balance of at least `amount`
        await expectRevert(this.ERC20FaucetExampleInstance.transfer(owner, new BN('11'), {from: spender}),"ERC20: transfer amount exceeds balance");        
    });

    //Test 7
    it("Check approve() and allowance() functions", async function () {
        let amount = new BN('10');
        await this.ERC20FaucetExampleInstance.approve(spender, amount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(amount);

        //`spender` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.approve(address0, amount, {from: owner}),"ERC20: approve to the zero address");        
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

        //Testing reverts
        //`sender` and `recipient` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.transferFrom(owner, address0, amount, {from: spender}),"Insufficient allowance");
        await expectRevert(this.ERC20FaucetExampleInstance.transferFrom(address0, spender, amount, {from: spender}),"Insufficient allowance");

        //`sender` must have a balance of at least `amount`.
        await this.ERC20FaucetExampleInstance.approve(owner, new BN(20), {from: spender});
        await expectRevert(this.ERC20FaucetExampleInstance.transferFrom(spender, owner, new BN(20), {from: owner}),"ERC20: transfer amount exceeds balance");

        //the caller must have allowance for `sender`'s tokens of at least `amount`.
        await expectRevert(this.ERC20FaucetExampleInstance.transferFrom(owner, spender, new BN(11), {from: spender}),"Insufficient allowance");
    });

    //Test 9
    it("Check increaseAllowance() function", async function () {
        let initialAmount = new BN('10');
        let addedAmount = new BN('5');
        await this.ERC20FaucetExampleInstance.approve(spender, initialAmount, {from: owner});
        await this.ERC20FaucetExampleInstance.increaseAllowance(spender, addedAmount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(initialAmount.add(addedAmount));

        //`spender` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.increaseAllowance(address0, addedAmount, {from: owner}),"ERC20: approve to the zero address");
    });

    //Test 10
    it("Check decreaseAllowance() function", async function () {
        let initialAmount = new BN('10');
        let subtractedAmount = new BN('5');
        await this.ERC20FaucetExampleInstance.approve(spender, initialAmount, {from: owner});
        await this.ERC20FaucetExampleInstance.decreaseAllowance(spender, subtractedAmount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(initialAmount.sub(subtractedAmount));

        //Testing reverts
        //`spender` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.decreaseAllowance(address0, subtractedAmount, {from: owner}),"ERC20: decreased allowance below zero");  

        //`spender` must have allowance for the caller of at least `subtractedValue`.
        let subtractedAmount2 = new BN('50');
        await expectRevert(this.ERC20FaucetExampleInstance.decreaseAllowance(spender, subtractedAmount2, {from: owner}),"ERC20: decreased allowance below zero");
    });


    //Testing ERC20 internal fonctions
    //Test 11
    it("Check _transfer() function", async function () {
        console.log("Testing ERC20 internal functions:");
        let ownerBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        let amount = new BN('10');

        await this.ERC20FaucetExampleInstance.internalTransfer(owner, spender, amount, {from: owner});

        let ownerBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(amount));

        //`sender` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalTransfer(address0, spender, amount),"ERC20: transfer from the zero address")

        //`recipient` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalTransfer(owner, address0, amount, {from:owner}),"ERC20: transfer to the zero address")
        
        //`sender` must have a balance of at least `amount`.
        await expectRevert(this.ERC20FaucetExampleInstance.internalTransfer(owner, spender, new BN('1000001'), {from:owner}),"ERC20: transfer amount exceeds balance")
    });

    //Test 12
    it("Check _mint() function", async function () {
        let spenderBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        let amount = new BN('10');
        let totalSupplyBefore = await this.ERC20FaucetExampleInstance.totalSupply();

        await this.ERC20FaucetExampleInstance.internalMint(spender, amount);

        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        let totalSupplyAfter = await this.ERC20FaucetExampleInstance.totalSupply();

        expect(spenderBalanceAfter).to.be.bignumber.equal(spenderBalanceBefore.add(amount));
        expect(totalSupplyAfter).to.be.bignumber.equal(totalSupplyBefore.add(amount));

        //`recipient` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalMint(address0, amount),"ERC20: mint to the zero address")
    });

    //Test 13
    it("Check _burn() function", async function () {
        let ownerBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let amount = new BN('10');
        let totalSupplyBefore = await this.ERC20FaucetExampleInstance.totalSupply();

        await this.ERC20FaucetExampleInstance.internalBurn(owner, amount);

        let ownerBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let totalSupplyAfter = await this.ERC20FaucetExampleInstance.totalSupply();

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(totalSupplyAfter).to.be.bignumber.equal(totalSupplyBefore.sub(amount));

        //`account` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalBurn(address0, amount),"ERC20: burn from the zero address");

        //`account` must have at least `amount` tokens.
        await expectRevert(this.ERC20FaucetExampleInstance.internalBurn(owner, new BN('1000000')),"ERC20: burn amount exceeds balance");
    });

    //Test 14
    it("Check _approve() function", async function () {
        let amount = new BN('10');
        await this.ERC20FaucetExampleInstance.internalApprove(owner, spender, amount, {from: owner});
        let amountApproved = await this.ERC20FaucetExampleInstance.allowance(owner, spender); 
        expect(amountApproved).to.be.bignumber.equal(amount);

        //`owner` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalApprove(address0, spender, amount),"ERC20: approve from the zero address");

        //`spender` cannot be the zero address.
        await expectRevert(this.ERC20FaucetExampleInstance.internalApprove(owner, address0, amount, {from: owner}),"ERC20: approve to the zero address");        
    });

    //Test 15
    it("Check _burnFrom() function", async function () {
        let ownerBalanceBefore = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let amount = new BN('10');
        let totalSupplyBefore = await this.ERC20FaucetExampleInstance.totalSupply();

        await this.ERC20FaucetExampleInstance.approve(spender, amount, {from:owner});
        let spenderAllowanceBefore = await this.ERC20FaucetExampleInstance.allowance(owner, spender);

        await this.ERC20FaucetExampleInstance.internalBurnFrom(owner, amount, {from:spender});

        let ownerBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(owner);
        let totalSupplyAfter = await this.ERC20FaucetExampleInstance.totalSupply();
        let spenderAllowanceAfter = await this.ERC20FaucetExampleInstance.allowance(owner, spender);

        expect(ownerBalanceAfter).to.be.bignumber.equal(ownerBalanceBefore.sub(amount));
        expect(totalSupplyAfter).to.be.bignumber.equal(totalSupplyBefore.sub(amount));
        expect(spenderAllowanceAfter).to.be.bignumber.equal(spenderAllowanceBefore.sub(amount));

        //`account` must have at least `amount` tokens.
        await expectRevert(this.ERC20FaucetExampleInstance.internalBurnFrom(owner, new BN('1000000')),"ERC20: burn amount exceeds balance");
    });

    //Testing Ownable fonctions
    //Test 16
    it('Check owner() function', async function () {
        console.log("Testing Ownable fonctions:");
        let currentOwner = await this.ERC20FaucetExampleInstance.owner();
        expect(currentOwner).to.be.equal(owner);
    });

    //Test 17
    it('Check isOwner() function', async function () {
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: owner});
        expect(isOwner).to.be.equal(true);
    });

    //Test 18
    it('Check renounceOwnership() function', async function () {
        await this.ERC20FaucetExampleInstance.renounceOwnership({from: owner});
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: owner});
        expect(isOwner).to.be.equal(false);
    })

    //Test 19
    it('Check transferOwnership() function', async function () {
        await this.ERC20FaucetExampleInstance.transferOwnership(spender, {from: owner});
        let isOwner = await this.ERC20FaucetExampleInstance.isOwner({from: spender});
        expect(isOwner).to.be.equal(true);
    })

    //Test 20
    it('Check onlyOwner() modifier', async function () {
        await expectRevert(this.ERC20FaucetExampleInstance.transferOwnership(spender, {from: spender}),"Ownable: caller is not the owner");
    })    


    //Testing token smart contract function
    //Test 21
    it('Check getTokens() function', async function () {
        console.log("Testing token smart contract function:");
        await this.ERC20FaucetExampleInstance.getTokens(20, {from: spender});
        let spenderBalanceAfter = await this.ERC20FaucetExampleInstance.balanceOf(spender);
        expect(spenderBalanceAfter).to.be.bignumber.equal(new BN(20));
        
        let totalSupplyAfter = await this.ERC20FaucetExampleInstance.totalSupply();
        expect(totalSupplyAfter).to.be.bignumber.equal(new BN(_totalSupply + 20));

        //Verify can't to get tokens before 2min after last mint. 
        await expectRevert(this.ERC20FaucetExampleInstance.getTokens(1, {from: spender}),"Function can be called every two minutes, wait");
    })
});