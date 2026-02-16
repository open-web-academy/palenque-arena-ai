// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./ElementalMatch.sol";

contract ElementalFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    address public operator;
    ElementalMatch[] public matches;

    event MatchCreated(address indexed matchAddress, uint256 startTime, uint256 closeTime);

    constructor() {
        _disableInitializers();
    }

    function initialize(address _operator) public initializer {
        __Ownable_init(msg.sender);
        operator = _operator;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function createMatch(uint256 startTime, uint256 closeDuration) external returns (address) {
        require(msg.sender == operator, "Only operator");

        ElementalMatch impl = new ElementalMatch();
        bytes memory initData = abi.encodeCall(
            ElementalMatch.initialize,
            (operator, address(this), startTime, closeDuration)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        matches.push(ElementalMatch(address(proxy)));
        emit MatchCreated(address(proxy), startTime, startTime + closeDuration);
        return address(proxy);
    }

    function matchCount() external view returns (uint256) {
        return matches.length;
    }

    function getLastMatch() external view returns (address) {
        require(matches.length > 0, "No matches");
        return address(matches[matches.length - 1]);
    }
}
