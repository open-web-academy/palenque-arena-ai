// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ElementalFactory.sol";
import "../src/Ruleta.sol";

/// @notice Deploys Elemental + Ruleta in one run. Use same OPERATOR_ADDRESS as your operator wallet.
contract DeployElementalAndRuletaScript is Script {
    function run() external {
        address operator = vm.envAddress("OPERATOR_ADDRESS");

        vm.startBroadcast();

        // --- Elemental ---
        ElementalFactory elementalImpl = new ElementalFactory();
        bytes memory elementalInit = abi.encodeCall(ElementalFactory.initialize, (operator));
        ERC1967Proxy elementalProxy = new ERC1967Proxy(address(elementalImpl), elementalInit);
        address elementalAddr = address(elementalProxy);

        // --- Ruleta ---
        Ruleta ruletaImpl = new Ruleta();
        bytes memory ruletaInit = abi.encodeCall(Ruleta.initialize, (operator));
        ERC1967Proxy ruletaProxy = new ERC1967Proxy(address(ruletaImpl), ruletaInit);
        address ruletaAddr = address(ruletaProxy);

        vm.stopBroadcast();

        console.log("---");
        console.log("ElementalFactory proxy:", elementalAddr);
        console.log("Ruleta proxy:", ruletaAddr);
        console.log("---");
        console.log("Add to packages/web/.env:");
        console.log("VITE_ELEMENTAL_FACTORY_ADDRESS=", elementalAddr);
        console.log("VITE_RULETA_ADDRESS=", ruletaAddr);
        console.log("---");
        console.log("Add to packages/operator/.env:");
        console.log("ELEMENTAL_FACTORY_ADDRESS=", elementalAddr);
        console.log("RULETA_ADDRESS=", ruletaAddr);
    }
}
