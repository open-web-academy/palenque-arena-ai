// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./Match.sol";

contract MatchFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    address public operator;
    address public palToken;
    Match[] public matches;

    event MatchCreated(address indexed matchAddress, string roosterA, string roosterB);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _operator, address _palToken) public initializer {
        __Ownable_init(msg.sender);
        
        operator = _operator;
        palToken = _palToken;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function createMatch(
        string memory roosterA,
        string memory roosterB,
        uint256 startTime,
        uint256 closeDuration
    ) external returns (address) {
        require(msg.sender == operator, "Only operator");

        // Deploy Match implementation
        Match matchImpl = new Match();
        
        // Deploy proxy and initialize
        bytes memory initData = abi.encodeCall(
            Match.initialize,
            (operator, address(this), palToken, roosterA, roosterB, startTime, closeDuration)
        );
        ERC1967Proxy matchProxy = new ERC1967Proxy(address(matchImpl), initData);
        
        matches.push(Match(address(matchProxy)));
        emit MatchCreated(address(matchProxy), roosterA, roosterB);
        return address(matchProxy);
    }

    function matchCount() external view returns (uint256) {
        return matches.length;
    }

    function getLastMatch() external view returns (address) {
        return address(matches[matches.length - 1]);
    }
}
