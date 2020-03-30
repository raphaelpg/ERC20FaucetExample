const ERC20FaucetExample = artifacts.require("ERC20FaucetExample");
const _name = "MyFaucetExample";
const _symbol = "MFE";
const _decimals = 18;
const _totalSupply = 1000000;

module.exports = function(deployer) {
  deployer.deploy(ERC20FaucetExample, _name, _symbol, _decimals, _totalSupply);
};
