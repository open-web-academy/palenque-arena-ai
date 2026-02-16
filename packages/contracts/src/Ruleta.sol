// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Symbols: 0=Jaguar, 1=Eagle, 2=Serpent, 3=Fire, 4=Skull
contract Ruleta is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    enum RoundState { Open, Closed, Settled }

    uint256 public constant N_SYMBOLS = 5;
    address public operator;

    uint256 public roundCount;
    mapping(uint256 => uint256) public closeTime;
    mapping(uint256 => uint256) public closeBlockNumber;
    mapping(uint256 => RoundState) public roundState;
    mapping(uint256 => uint256[N_SYMBOLS]) public pool;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public bets;
    mapping(uint256 => bytes32) public commitHash;
    mapping(uint256 => uint256) public winningSymbol;

    event RoundOpened(uint256 indexed roundId, uint256 closeTime);
    event BetPlaced(uint256 indexed roundId, address indexed user, uint256 symbol, uint256 amount);
    event RoundClosed(uint256 indexed roundId);
    event Revealed(uint256 indexed roundId, uint256 winningSymbol);
    event PayoutClaimed(uint256 indexed roundId, address indexed user, uint256 amount);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(address _operator) public initializer {
        __Ownable_init(msg.sender);
        operator = _operator;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function startRound(uint256 _closeTime) external onlyOperator {
        uint256 id = roundCount;
        roundCount++;
        closeTime[id] = _closeTime;
        roundState[id] = RoundState.Open;
        emit RoundOpened(id, _closeTime);
    }

    function placeBet(uint256 roundId, uint256 symbol) external payable {
        require(roundId < roundCount, "Invalid round");
        require(symbol < N_SYMBOLS, "Invalid symbol");
        require(msg.value > 0, "Bet must be > 0");
        require(roundState[roundId] == RoundState.Open, "Round not open");
        require(block.timestamp < closeTime[roundId], "Round closed");

        pool[roundId][symbol] += msg.value;
        bets[roundId][msg.sender][symbol] += msg.value;
        emit BetPlaced(roundId, msg.sender, symbol, msg.value);
    }

    function closeBets(uint256 roundId) external onlyOperator {
        require(roundState[roundId] == RoundState.Open, "Not open");
        require(block.timestamp >= closeTime[roundId], "Too early");
        roundState[roundId] = RoundState.Closed;
        closeBlockNumber[roundId] = block.number - 1;
        emit RoundClosed(roundId);
    }

    function commit(uint256 roundId, bytes32 _commitHash) external onlyOperator {
        require(roundState[roundId] == RoundState.Closed, "Not closed");
        commitHash[roundId] = _commitHash;
    }

    function reveal(uint256 roundId, uint256 seed) external onlyOperator {
        require(roundState[roundId] == RoundState.Closed, "Not closed");
        require(keccak256(abi.encodePacked(seed, address(operator))) == commitHash[roundId], "Invalid seed");

        uint256 randomValue = uint256(keccak256(abi.encodePacked(seed, blockhash(closeBlockNumber[roundId])))) % 1e6;
        winningSymbol[roundId] = randomValue % N_SYMBOLS;
        roundState[roundId] = RoundState.Settled;

        emit Revealed(roundId, winningSymbol[roundId]);
    }

    function claimPayout(uint256 roundId) external {
        require(roundState[roundId] == RoundState.Settled, "Not settled");

        uint256 sym = winningSymbol[roundId];
        uint256 myBet = bets[roundId][msg.sender][sym];
        require(myBet > 0, "No winning bet");

        uint256 totalWinning = pool[roundId][sym];
        uint256 totalPool = pool[roundId][0] + pool[roundId][1] + pool[roundId][2] + pool[roundId][3] + pool[roundId][4];

        uint256 payout = (myBet * totalPool) / totalWinning;

        bets[roundId][msg.sender][sym] = 0;

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "Transfer failed");
        emit PayoutClaimed(roundId, msg.sender, payout);
    }

    function getPool(uint256 roundId, uint256 symbol) external view returns (uint256) {
        return pool[roundId][symbol];
    }

    function getMyBet(uint256 roundId, address user, uint256 symbol) external view returns (uint256) {
        return bets[roundId][user][symbol];
    }
}
