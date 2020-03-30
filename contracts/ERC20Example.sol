pragma solidity 0.5.16;

import "./ERC20.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract ERC20FaucetExample is ERC20, Ownable {
    string public name;
    string public symbol;
    uint256 public decimals;
    uint256 private lastExecutionTime;

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 totalSupply) public {
      name = _name;
      symbol = _symbol;
      decimals = _decimals;

      lastExecutionTime = 0;
      _mint(msg.sender, totalSupply);
    }

    function getTokens(uint256 amount) public {
    	uint256 executionTime = now;
    	require(executionTime >= lastExecutionTime + 2 * 1 minutes, "Function can be called every two minutes, wait");

    	lastExecutionTime = now;
    	_mint(msg.sender, amount);
    }

    //Functions for testing purposes
    function internalTransfer(address sender, address recipient, uint256 amount) public {
      _transfer(sender, recipient, amount);
    }

    function internalMint(address account, uint256 amount) public {
      _mint(account, amount);
    }

    function internalBurn(address account, uint256 amount) public {
      _burn(account, amount);
    }

    function internalApprove(address owner, address spender, uint256 amount) public {
      _approve(owner, spender, amount);
    }

    function internalBurnFrom(address account, uint256 amount) public {
      _burnFrom(account, amount);
    }
}