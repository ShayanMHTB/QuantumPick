// ctr/contracts/StandardLottery.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StandardLottery {
    IERC20 public token;
    uint256 public ticketPrice;
    uint256 public maxTickets;
    uint256 public minTickets;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public drawTime;
    uint256[] public prizePercentages;
    address public creator;
    
    uint256 public totalTickets;
    uint8 public status; // 0: active, 1: completed, 2: cancelled
    
    constructor(
        address _tokenAddress,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _minTickets,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _drawTime,
        uint256[] memory _prizePercentages,
        address _creator
    ) {
        token = IERC20(_tokenAddress);
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
        minTickets = _minTickets;
        startTime = _startTime;
        endTime = _endTime;
        drawTime = _drawTime;
        prizePercentages = _prizePercentages;
        creator = _creator;
        status = 0;
    }
    
    function buyTickets(uint256 quantity) external {
        require(status == 0, "Lottery not active");
        require(block.timestamp >= startTime, "Not started");
        require(block.timestamp <= endTime, "Ended");
        require(totalTickets + quantity <= maxTickets, "Exceeds max");
        
        uint256 cost = ticketPrice * quantity;
        require(token.transferFrom(msg.sender, address(this), cost), "Transfer failed");
        
        totalTickets += quantity;
    }
    
    function drawWinners() external {
        require(block.timestamp >= drawTime, "Too early");
        require(status == 0, "Already drawn");
        
        // Simplified - in real implementation, use Chainlink VRF
        status = 1;
    }
    
    function getDetails() external view returns (
        address tokenAddress,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _minTickets,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _drawTime,
        uint256 _totalTickets,
        uint8 _status
    ) {
        return (
            address(token),
            ticketPrice,
            maxTickets,
            minTickets,
            startTime,
            endTime,
            drawTime,
            totalTickets,
            status
        );
    }
}
