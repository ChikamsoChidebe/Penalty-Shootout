// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SafeTransfer
 * @notice Library for safe token and ETH transfers
 * @dev Provides safe transfer functions with proper error handling
 */
library SafeTransfer {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error TransferFailed();
    error InsufficientBalance();

    /*//////////////////////////////////////////////////////////////
                            ERC20 TRANSFERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Safe transfer of ERC20 tokens
     * @param token The ERC20 token contract
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function safeTransfer(IERC20 token, address to, uint256 amount) internal {
        bool success = token.transfer(to, amount);
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Safe transferFrom of ERC20 tokens
     * @param token The ERC20 token contract
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        bool success = token.transferFrom(from, to, amount);
        if (!success) revert TransferFailed();
    }

    /*//////////////////////////////////////////////////////////////
                            ETH TRANSFERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Safe transfer of ETH
     * @param to Recipient address
     * @param amount Amount to transfer in wei
     */
    function safeTransferETH(address payable to, uint256 amount) internal {
        if (address(this).balance < amount) revert InsufficientBalance();
        
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Get ETH balance of an address
     * @param account Address to check
     * @return balance ETH balance in wei
     */
    function getETHBalance(address account) internal view returns (uint256 balance) {
        return account.balance;
    }

    /**
     * @notice Get ERC20 token balance of an address
     * @param token The ERC20 token contract
     * @param account Address to check
     * @return balance Token balance
     */
    function getTokenBalance(IERC20 token, address account) internal view returns (uint256 balance) {
        return token.balanceOf(account);
    }
}