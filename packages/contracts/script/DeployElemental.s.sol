// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ElementalFactory.sol";

contract DeployElementalScript is Script {
    function run() external {
        address operator = vm.envAddress("OPERATOR_ADDRESS");

        vm.startBroadcast();

        ElementalFactory impl = new ElementalFactory();
        bytes memory initData = abi.encodeCall(ElementalFactory.initialize, (operator));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        console.log("ElementalFactory proxy:", address(proxy));

        vm.stopBroadcast();
    }
}
