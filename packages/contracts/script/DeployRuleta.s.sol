// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/Ruleta.sol";

contract DeployRuletaScript is Script {
    function run() external {
        address operator = vm.envAddress("OPERATOR_ADDRESS");

        vm.startBroadcast();

        Ruleta impl = new Ruleta();
        bytes memory initData = abi.encodeCall(Ruleta.initialize, (operator));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        console.log("Ruleta proxy:", address(proxy));

        vm.stopBroadcast();
    }
}
