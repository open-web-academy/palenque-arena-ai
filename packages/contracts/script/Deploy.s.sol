// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Script.sol";
import "../src/MatchFactory.sol";

contract DeployScript is Script {
    function run() external {
        address operator = vm.envAddress("OPERATOR_ADDRESS");
        address palToken = vm.envAddress("PAL_TOKEN_ADDRESS");

        vm.startBroadcast();

        MatchFactory factory = new MatchFactory(operator, palToken);

        console.log("MatchFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
