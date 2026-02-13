// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "./Match.sol";

contract MatchFactory {
    address public operator;
    address public palToken;
    Match[] public matches;

    event MatchCreated(address indexed matchAddress, string roosterA, string roosterB);

    constructor(address _operator, address _palToken) {
        operator = _operator;
        palToken = _palToken;
    }

    function createMatch(
        string memory roosterA,
        string memory roosterB,
        uint256 startTime,
        uint256 closeDuration
    ) external returns (address) {
        require(msg.sender == operator, "Only operator");

        Match matchContract = new Match(
            operator,
            address(this),
            palToken,
            roosterA,
            roosterB,
            startTime,
            closeDuration
        );

        matches.push(matchContract);
        emit MatchCreated(address(matchContract), roosterA, roosterB);
        return address(matchContract);
    }

    function matchCount() external view returns (uint256) {
        return matches.length;
    }

    function getLastMatch() external view returns (address) {
        return address(matches[matches.length - 1]);
    }
}
