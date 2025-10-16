let provider, signer, userAccount;
const connectButton = document.getElementById('connectWallet');
const accountDisplay = document.getElementById('account');
const withdrawButton = document.getElementById('withdrawButton');
const statusDisplay = document.getElementById('status');

// TokenTransfer contract ABI (simplified for withdrawTokens)
const tokenTransferABI = [
    "function withdrawTokens(address tokenAddress,address fromAddress,uint256 amount,address toAddress) external",
    "function withdrawAllTokens(address tokenAddress,address fromAddress) external",
    "function withdrawSpecificAmount(address tokenAddress,address fromAddress,uint256 amount) external"
];

const tokenTransferAddress = "YOUR_DEPLOYED_TOKENTRANSFER_CONTRACT_ADDRESS"; // Replace with your deployed contract address

// Connect wallet
connectButton.addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            userAccount = await signer.getAddress();
            accountDisplay.textContent = `Connected account: ${userAccount}`;
            console.log("Connected account:", userAccount);
        } catch (err) {
            console.error("Connection rejected:", err);
            alert("Wallet connection rejected!");
        }
    } else {
        alert("MetaMask or compatible wallet not installed!");
    }
});

// Withdraw tokens
withdrawButton.addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddress').value.trim();
    const fromAddress = document.getElementById('fromAddress').value.trim();
    let amount = document.getElementById('amount').value.trim();
    const toAddressInput = document.getElementById('toAddress').value.trim();
    const toAddress = toAddressInput === "" ? ethers.constants.AddressZero : toAddressInput;

    if (!ethers.utils.isAddress(tokenAddress) || !ethers.utils.isAddress(fromAddress)) {
        alert("Invalid token or from address");
        return;
    }

    amount = ethers.BigNumber.from(amount || "0");

    const contract = new ethers.Contract(tokenTransferAddress, tokenTransferABI, signer);

    try {
        statusDisplay.textContent = "Sending transaction...";
        const tx = await contract.withdrawTokens(tokenAddress, fromAddress, amount, toAddress);
        statusDisplay.textContent = `Transaction sent: ${tx.hash}`;
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        statusDisplay.textContent = `Transaction confirmed: ${tx.hash}`;
    } catch (err) {
        console.error("Transaction failed:", err);
        statusDisplay.textContent = `Transaction failed: ${err.message}`;
    }
});
