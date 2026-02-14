// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IERC20.sol";

contract Match is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    enum State { Open, Closed, Settled }

    // Rooster identifiers
    string public roosterA;
    string public roosterB;

    // Timing
    uint256 public startTime;
    uint256 public closeTime;
    uint256 public closeBlockNumber;

    // Betting (native MON)
    uint256 public betPoolA;
    uint256 public betPoolB;
    mapping(address => uint256) public betsA;
    mapping(address => uint256) public betsB;

    // Boosts (PAL token)
    IERC20 public palToken;
    uint256 public boostPoolA;
    uint256 public boostPoolB;
    mapping(address => uint256) public boostedA;
    mapping(address => uint256) public boostedB;

    // Caps
    uint256 public maxBoostPerWallet = 1000e18;
    uint256 public maxBoostPerSide = 10000e18;

    // Randomness
    bytes32 public commitHash;
    uint256 public randomSeed;

    // Results
    State public state = State.Open;
    bool public winnerA;

    // Operator
    address public operator;
    address public factory;

    event BetPlaced(address indexed bettor, bool isA, uint256 amount);
    event Boosted(address indexed booster, bool isA, uint256 amount);
    event Committed(bytes32 commitHash);
    event Revealed(uint256 seed);
    event Settled(bool winnerIsA);
    event PayoutClaimed(address indexed claimer, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _operator,
        address _factory,
        address _palToken,
        string memory _roosterA,
        string memory _roosterB,
        uint256 _startTime,
        uint256 _closeDuration
    ) public initializer {
        __Ownable_init(msg.sender);
        
        operator = _operator;
        factory = _factory;
        palToken = IERC20(_palToken);
        roosterA = _roosterA;
        roosterB = _roosterB;
        startTime = _startTime;
        closeTime = _startTime + _closeDuration;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function betOn(bool isA) external payable {
        require(state == State.Open, "Match not open");
        require(msg.value > 0, "Bet must be > 0");

        if (isA) {
            betPoolA += msg.value;
            betsA[msg.sender] += msg.value;
        } else {
            betPoolB += msg.value;
            betsB[msg.sender] += msg.value;
        }

        emit BetPlaced(msg.sender, isA, msg.value);
    }

    function boost(bool isA, uint256 amount) external {
        require(state == State.Open, "Match not open");
        require(amount > 0, "Boost must be > 0");

        uint256 newTotal = (isA ? boostedA[msg.sender] : boostedB[msg.sender]) + amount;
        require(newTotal <= maxBoostPerWallet, "Exceeds max boost per wallet");

        if (isA) {
            require(boostPoolA + amount <= maxBoostPerSide, "Exceeds max boost per side");
            boostPoolA += amount;
            boostedA[msg.sender] += amount;
        } else {
            require(boostPoolB + amount <= maxBoostPerSide, "Exceeds max boost per side");
            boostPoolB += amount;
            boostedB[msg.sender] += amount;
        }

        palToken.transferFrom(msg.sender, address(this), amount);
        emit Boosted(msg.sender, isA, amount);
    }

    function closeBets() external {
        require(msg.sender == operator, "Only operator");
        require(state == State.Open, "Not open");
        require(block.timestamp >= closeTime, "Too early to close");
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

        uint256 boostEffectA = sqrt(boostPoolA);
        uint256 boostEffectB = sqrt(boostPoolB);

        uint256 powerA = 1e6;
        uint256 powerB = 1e6;

        uint256 totalPower = powerA + boostEffectA + powerB + boostEffectB;
        uint256 pA = (totalPower == 0) ? 5e5 : ((powerA + boostEffectA) * 1e6) / totalPower;

        if (pA > 7e5) pA = 7e5;
        if (pA < 3e5) pA = 3e5;

        winnerA = randomValue < pA;
        state = State.Settled;

        emit Revealed(seed);
        emit Settled(winnerA);
    }

    function claimPayout() external {
        require(state == State.Settled, "Match not settled");

        uint256 myBet = winnerA ? betsA[msg.sender] : betsB[msg.sender];
        require(myBet > 0, "No winning bet");

        uint256 totalWinningBets = winnerA ? betPoolA : betPoolB;
        uint256 totalPool = betPoolA + betPoolB;

        uint256 payout = (myBet * totalPool) / totalWinningBets;

        betsA[msg.sender] = 0;
        betsB[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "Transfer failed");

        emit PayoutClaimed(msg.sender, payout);
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function currentOdds() external view returns (uint256 pA, uint256 pB) {
        if (state != State.Open) return (0, 0);

        uint256 boostEffectA = sqrt(boostPoolA);
        uint256 boostEffectB = sqrt(boostPoolB);
        uint256 powerA = 1e6;
        uint256 powerB = 1e6;

        uint256 totalPower = powerA + boostEffectA + powerB + boostEffectB;
        pA = (totalPower == 0) ? 5e5 : ((powerA + boostEffectA) * 1e6) / totalPower;

        if (pA > 7e5) pA = 7e5;
        if (pA < 3e5) pA = 3e5;

        pB = 1e6 - pA;
    }
}
