import { network } from "hardhat";

const { ethers } = await network.create();

const library = await ethers.deployContract("LibraryManagement");

await library.waitForDeployment();

console.log(
    "LibraryManagement deployed to:",
    await library.getAddress()
);