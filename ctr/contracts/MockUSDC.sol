// contracts/MockUSDC.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 10000000 * 10 ** decimals()); // Mint 10,000,000 USDC
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDC uses 6 decimals
    }
}
