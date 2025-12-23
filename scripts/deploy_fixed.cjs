const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");
    const TrustGig = await hre.ethers.getContractFactory("TrustGig");
    const trustGig = await TrustGig.deploy();

    await trustGig.waitForDeployment();
    const address = await trustGig.getAddress();

    console.log("----------------------------------------------------");
    console.log("ADDRESS_FOUND: " + address);
    console.log("----------------------------------------------------");
    require("fs").writeFileSync("address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
