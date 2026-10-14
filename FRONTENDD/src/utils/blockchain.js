import { ethers } from "ethers";

// Import contract info after deployment
let contractInfo = { address: "", abi: [] };
try {
  contractInfo = require("./contractInfo.json");
} catch (e) {
  console.warn("contractInfo.json not found. Deploy the contract first.");
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask to continue.");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
};

export const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
};

export const getContract = async (withSigner = true) => {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
  }
  return new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
};

export const adoptAnimalOnChain = async ({ animalId, adopterName, email, city, state, reason }) => {
  const contract = await getContract(true);
  const fee = await contract.adoptionFee();

  const tx = await contract.adoptAnimal(
    animalId,
    adopterName,
    email,
    city,
    state,
    reason,
    { value: fee }
  );

  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    fee: ethers.formatEther(fee),
    from: receipt.from,
  };
};

export const checkIfAdoptedOnChain = async (animalId) => {
  try {
    const contract = await getContract(false);
    return await contract.isAdopted(animalId);
  } catch {
    return false;
  }
};

export const getWalletBalance = async (address) => {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const shortenAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
