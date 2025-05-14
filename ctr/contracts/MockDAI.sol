// contracts/MockDAI.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20 {
    constructor() ERC20("Dai Stablecoin", "DAI") {
        _mint(msg.sender, 100000000 * 10 ** decimals()); // Mint 100,000,000 DAI
    }

    function decimals() public pure override returns (uint8) {
        return 18; // DAI uses 18 decimals
    }
}
