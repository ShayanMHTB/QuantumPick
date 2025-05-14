// ctr/contracts/LotteryFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StandardLottery.sol";

contract LotteryFactory {
    event LotteryCreated(address indexed creator, address indexed lotteryAddress);

    function createLottery(
        address tokenAddress,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 minTickets,
        uint256 startTime,
        uint256 endTime,
        uint256 drawTime,
        uint256[] memory prizePercentages
    ) external returns (address) {
        StandardLottery lottery = new StandardLottery(
            tokenAddress,
            ticketPrice,
            maxTickets,
            minTickets,
            startTime,
            endTime,
            drawTime,
            prizePercentages,
            msg.sender
        );
        
        emit LotteryCreated(msg.sender, address(lottery));
        return address(lottery);
    }
}
