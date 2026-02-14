// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Test.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/Match.sol";
import "../src/MatchFactory.sol";

contract MockERC20 is IERC20 {
    mapping(address => uint256) public balanceOf;
    uint8 public decimals = 18;

    constructor() {
        balanceOf[msg.sender] = 1e6 * 1e18;
    }

    function transfer(address to, uint256 amount) external pure returns (bool) { return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MatchTest is Test {
    MatchFactory factory;
    MockERC20 pal;
    address operator = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    function setUp() public {
        pal = new MockERC20();
        
        // Deploy implementation and proxy
        MatchFactory impl = new MatchFactory();
        bytes memory initData = abi.encodeCall(
            MatchFactory.initialize,
            (operator, address(pal))
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        factory = MatchFactory(address(proxy));
    }

    function testCreateMatch() public {
        vm.prank(operator);
        address matchAddr = factory.createMatch("Phoenix", "Dragon", block.timestamp, 3600);
        assert(matchAddr != address(0));
    }

    function testBetAndBoost() public {
        vm.prank(operator);
        address matchAddr = factory.createMatch("Phoenix", "Dragon", block.timestamp, 3600);
        Match matchContract = Match(payable(matchAddr));

        vm.prank(alice);
        vm.deal(alice, 2 ether);
        matchContract.betOn{value: 1 ether}(true);

        vm.prank(bob);
        vm.deal(bob, 2 ether);
        matchContract.betOn{value: 1 ether}(false);

        assert(matchContract.betPoolA() == 1 ether);
        assert(matchContract.betPoolB() == 1 ether);
    }
}
