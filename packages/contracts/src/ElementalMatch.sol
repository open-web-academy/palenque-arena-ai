// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Elements: 0=Fire, 1=Water, 2=Air, 3=Earth
contract ElementalMatch is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    enum State { Open, Closed, Settled }

    uint256 public constant N_ELEMENTS = 4;
    uint256 public startTime;
    uint256 public closeTime;
    uint256 public closeBlockNumber;

    uint256[N_ELEMENTS] public betPool;
    mapping(address => mapping(uint256 => uint256)) public bets;

    bytes32 public commitHash;
    uint256 public randomSeed;
    uint256 public winnerElement; // 0-3
    State public state = State.Open;

    address public operator;
    address public factory;

    event BetPlaced(address indexed bettor, uint256 element, uint256 amount);
    event Committed(bytes32 commitHash);
    event Revealed(uint256 seed, uint256 winnerElement);
    event Settled(uint256 winnerElement);
    event PayoutClaimed(address indexed claimer, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _operator,
        address _factory,
        uint256 _startTime,
        uint256 _closeDuration
    ) public initializer {
        __Ownable_init(msg.sender);
        operator = _operator;
        factory = _factory;
        startTime = _startTime;
        closeTime = _startTime + _closeDuration;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function betOn(uint256 element) external payable {
        require(state == State.Open, "Not open");
        require(element < N_ELEMENTS, "Invalid element");
        require(msg.value > 0, "Bet must be > 0");

        betPool[element] += msg.value;
        bets[msg.sender][element] += msg.value;
        emit BetPlaced(msg.sender, element, msg.value);
    }

    function closeBets() external {
        require(msg.sender == operator, "Only operator");
        require(state == State.Open, "Not open");
        require(block.timestamp >= closeTime, "Too early");
        state = State.Closed;
        closeBlockNumber = block.number - 1;
    }

    function commit(bytes32 _commitHash) external {
        require(msg.sender == operator, "Only operator");
        require(state == State.Closed, "Not closed");
        commitHash = _commitHash;
        emit Committed(_commitHash);
    }

    function reveal(uint256 seed) external {
        require(msg.sender == operator, "Only operator");
        require(state == State.Closed, "Not closed");
        require(keccak256(abi.encodePacked(seed, address(operator))) == commitHash, "Invalid seed");

        randomSeed = seed;
        uint256 randomValue = uint256(keccak256(abi.encodePacked(seed, blockhash(closeBlockNumber)))) % 1e6;
        winnerElement = randomValue % N_ELEMENTS;
        state = State.Settled;

        emit Revealed(seed, winnerElement);
        emit Settled(winnerElement);
    }

    function claimPayout() external {
        require(state == State.Settled, "Not settled");

        uint256 myBet = bets[msg.sender][winnerElement];
        require(myBet > 0, "No winning bet");

        uint256 totalWinningBets = betPool[winnerElement];
        uint256 totalPool = betPool[0] + betPool[1] + betPool[2] + betPool[3];

        uint256 payout = (myBet * totalPool) / totalWinningBets;

        bets[msg.sender][winnerElement] = 0;

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "Transfer failed");
        emit PayoutClaimed(msg.sender, payout);
    }

    function currentOdds(uint256 element) external view returns (uint256) {
        if (state != State.Open || element >= N_ELEMENTS) return 0;
        uint256 total = betPool[0] + betPool[1] + betPool[2] + betPool[3];
        if (total == 0) return 25e4; // 25% each
        return (betPool[element] * 1e6) / total;
    }
}
