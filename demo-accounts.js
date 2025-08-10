const { ethers } = require('ethers');

// Generate demo accounts for Somnia testnet
function generateDemoAccounts(count = 3) {
    console.log('🎬 Demo Accounts for Somnia Testnet\n');
    
    for (let i = 1; i <= count; i++) {
        const wallet = ethers.Wallet.createRandom();
        console.log(`Account ${i}:`);
        console.log(`Address: ${wallet.address}`);
        console.log(`Private Key: ${wallet.privateKey}`);
        console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
        console.log('---');
    }
    
    console.log('\n💡 Instructions:');
    console.log('1. Copy any private key to your .env file');
    console.log('2. Visit https://quest.somnia.network to get testnet ETH');
    console.log('3. Use different accounts for Player 1 and Player 2 in demo');
}

generateDemoAccounts();