const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    console.log("Deploying TrustGig contract...");

    const TrustGig = await hre.ethers.getContractFactory("TrustGig");
    const trustGig = await TrustGig.deploy();

    await trustGig.waitForDeployment();
    const address = await trustGig.getAddress();

    console.log(`TrustGig deployed to ${address}`);

    // Save the address to a file so the frontend can read it
    const addressFile = path.join(__dirname, "../src/contract-address.json");
    fs.writeFileSync(
        addressFile,
        JSON.stringify({ address: address }, undefined, 2)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
