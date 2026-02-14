// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/MatchFactory.sol";

contract DeployProxyScript is Script {
    function run() external {
        address operator = vm.envAddress("OPERATOR_ADDRESS");
        address palToken = vm.envAddress("PAL_TOKEN_ADDRESS");

        vm.startBroadcast();

        // Deploy MatchFactory implementation
        MatchFactory factoryImpl = new MatchFactory();
        console.log("MatchFactory implementation deployed at:", address(factoryImpl));

        // Deploy proxy for MatchFactory
        bytes memory initData = abi.encodeCall(
            MatchFactory.initialize,
            (operator, palToken)
        );
        ERC1967Proxy factoryProxy = new ERC1967Proxy(
            address(factoryImpl),
            initData
        );
        console.log("MatchFactory proxy deployed at:", address(factoryProxy));
        console.log("Factory address (use this):", address(factoryProxy));

        vm.stopBroadcast();
    }
}
