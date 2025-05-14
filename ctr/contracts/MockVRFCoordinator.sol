// contracts/MockVRFCoordinator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVRFConsumer {
    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external;
}

/**
 * @title MockVRFCoordinator
 * @dev Mock implementation of Chainlink VRF for local testing
 */
contract MockVRFCoordinator {
    struct Request {
        address consumer;
        uint32 numWords;
        uint256 blockNumber;
    }
    
    uint256 private _nextRequestId = 1;
    mapping(uint256 => Request) public requests;
    uint256 private _seed = 12345; // Deterministic seed for testing
    
    event RandomWordsRequested(
        address indexed consumer,
        uint256 indexed requestId,
        uint32 numWords
    );
    
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256[] randomWords
    );
    
    function requestRandomWords(
        bytes32 keyHash, // ignored in mock
        uint64 subId, // ignored in mock
        uint16 minimumRequestConfirmations, // ignored in mock
        uint32 callbackGasLimit, // ignored in mock
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = _nextRequestId++;
        
        requests[requestId] = Request({
            consumer: msg.sender,
            numWords: numWords,
            blockNumber: block.number
        });
        
        emit RandomWordsRequested(msg.sender, requestId, numWords);
        
        // Auto-fulfill in next block for testing
        return requestId;
    }
    
    function fulfillRandomWords(uint256 requestId) external {
        Request memory request = requests[requestId];
        require(request.consumer != address(0), "Invalid request");
        require(block.number > request.blockNumber, "Too early");
        
        uint256[] memory randomWords = new uint256[](request.numWords);
        
        // Generate pseudo-random numbers
        for (uint32 i = 0; i < request.numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encode(_seed, requestId, i)));
            _seed = randomWords[i]; // Update seed for next request
        }
        
        // Call the consumer's fulfillment function
        IVRFConsumer(request.consumer).rawFulfillRandomWords(requestId, randomWords);
        
        emit RandomWordsFulfilled(requestId, randomWords);
        
        // Clean up
        delete requests[requestId];
    }
    
    // Helper function to manually set seed for testing
    function setSeed(uint256 seed) external {
        _seed = seed;
    }
}
