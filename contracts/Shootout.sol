// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./lib/SafeTransfer.sol";

/**
 * @title Penalty Shootout Duel
 * @author Somnia Hackathon Team
 * @notice A fully on-chain penalty shootout betting game with commit-reveal fairness
 * @dev Implements escrow, commit-reveal, timeouts, and anti-griefing mechanisms
 */
contract Shootout is ReentrancyGuard, Ownable, Pausable {
    using SafeTransfer for IERC20;
    using SafeTransfer for address payable;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Number of rounds in each match (best of 3)
    uint8 public constant ROUNDS = 3;
    
    /// @notice Maximum protocol fee in basis points (2%)
    uint16 public constant MAX_FEE_BPS = 200;
    
    /// @notice Commit phase duration in seconds
    uint256 public constant COMMIT_DURATION = 300; // 5 minutes
    
    /// @notice Reveal phase duration in seconds
    uint256 public constant REVEAL_DURATION = 300; // 5 minutes
    
    /// @notice Join timeout duration in seconds
    uint256 public constant JOIN_TIMEOUT = 1800; // 30 minutes

    /*//////////////////////////////////////////////////////////////
                                ENUMS
    //////////////////////////////////////////////////////////////*/

    /// @notice Match states for lifecycle management
    enum MatchState {
        Created,        // Match created, waiting for opponent
        Joined,         // Opponent joined, ready for commits
        Committed,      // Both players committed, ready for reveals
        RevealWindow,   // In reveal phase, waiting for reveals
        Settled,        // Match settled, ready for claims
        Cancelled       // Match cancelled due to timeout or forfeit
    }

    /// @notice Player choices for penalty shots
    enum Choice {
        Left,    // 0
        Center,  // 1
        Right    // 2
    }

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Match data structure optimized for gas efficiency
    struct Match {
        address creator;           // Match creator (shooter)
        address opponent;          // Match opponent (keeper)
        address token;            // Token address (address(0) for native ETH)
        uint128 stake;            // Stake amount per player
        uint64 createdAt;         // Match creation timestamp
        uint64 joinDeadline;      // Deadline to join match
        uint64 commitDeadline;    // Deadline to commit choices
        uint64 revealDeadline;    // Deadline to reveal choices
        MatchState state;         // Current match state
        uint16 feeBps;           // Protocol fee in basis points
        bool creatorCommitted;    // Creator commitment status
        bool opponentCommitted;   // Opponent commitment status
        bool creatorRevealed;     // Creator reveal status
        bool opponentRevealed;    // Opponent reveal status
        address winner;           // Match winner address
        bytes32 creatorCommitment; // Creator's commitment hash
        bytes32 opponentCommitment; // Opponent's commitment hash
        uint8 creatorChoices;     // Creator's revealed choices (packed)
        uint8 opponentChoices;    // Opponent's revealed choices (packed)
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Match counter for unique IDs
    uint256 public matchCounter;
    
    /// @notice Protocol fee in basis points
    uint16 public feeBps = 100; // 1% default
    
    /// @notice Mapping of match ID to match data
    mapping(uint256 => Match) public matches;
    
    /// @notice Mapping of player to their active matches
    mapping(address => uint256[]) public playerMatches;
    
    /// @notice Accumulated protocol fees per token
    mapping(address => uint256) public protocolFees;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event MatchCreated(
        uint256 indexed matchId,
        address indexed creator,
        address indexed token,
        uint128 stake,
        uint64 joinDeadline
    );

    event MatchJoined(
        uint256 indexed matchId,
        address indexed opponent,
        uint64 commitDeadline
    );

    event ChoicesCommitted(
        uint256 indexed matchId,
        address indexed player,
        bytes32 commitment
    );

    event RevealWindowStarted(
        uint256 indexed matchId,
        uint64 revealDeadline
    );

    event ChoicesRevealed(
        uint256 indexed matchId,
        address indexed player,
        uint8 choices
    );

    event MatchSettled(
        uint256 indexed matchId,
        address indexed winner,
        uint8 creatorScore,
        uint8 opponentScore
    );

    event PrizeClaimed(
        uint256 indexed matchId,
        address indexed claimer,
        uint256 amount
    );

    event MatchCancelled(
        uint256 indexed matchId,
        address indexed canceller,
        string reason
    );

    event FeeUpdated(uint16 oldFee, uint16 newFee);

    event FeesWithdrawn(address indexed token, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidStake();
    error InvalidMatchState();
    error InvalidPlayer();
    error InvalidChoice();
    error InvalidCommitment();
    error InvalidReveal();
    error DeadlineExpired();
    error DeadlineNotReached();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error NotCommitted();
    error MatchNotFound();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidFee();
    error NoFeesToWithdraw();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier validMatch(uint256 matchId) {
        if (matchId == 0 || matchId > matchCounter) revert MatchNotFound();
        _;
    }

    modifier onlyMatchPlayer(uint256 matchId) {
        Match storage match_ = matches[matchId];
        if (msg.sender != match_.creator && msg.sender != match_.opponent) {
            revert InvalidPlayer();
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() Ownable(msg.sender) {}

    /*//////////////////////////////////////////////////////////////
                            MATCH CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new penalty shootout match
     * @param token Token address (address(0) for native ETH)
     * @param stake Stake amount per player
     * @return matchId The created match ID
     */
    function createMatch(
        address token,
        uint128 stake
    ) external payable whenNotPaused nonReentrant returns (uint256 matchId) {
        if (stake == 0) revert InvalidStake();

        // Handle payment
        if (token == address(0)) {
            if (msg.value != stake) revert InvalidStake();
        } else {
            if (msg.value != 0) revert InvalidStake();
            IERC20(token).safeTransferFrom(msg.sender, address(this), stake);
        }

        matchId = ++matchCounter;
        
        Match storage match_ = matches[matchId];
        match_.creator = msg.sender;
        match_.token = token;
        match_.stake = stake;
        match_.createdAt = uint64(block.timestamp);
        match_.joinDeadline = uint64(block.timestamp + JOIN_TIMEOUT);
        match_.state = MatchState.Created;
        match_.feeBps = feeBps;

        playerMatches[msg.sender].push(matchId);

        emit MatchCreated(matchId, msg.sender, token, stake, match_.joinDeadline);
    }

    /**
     * @notice Join an existing match
     * @param matchId The match ID to join
     */
    function joinMatch(uint256 matchId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
        validMatch(matchId) 
    {
        Match storage match_ = matches[matchId];
        
        if (match_.state != MatchState.Created) revert InvalidMatchState();
        if (block.timestamp > match_.joinDeadline) revert DeadlineExpired();
        if (msg.sender == match_.creator) revert InvalidPlayer();

        // Handle payment
        if (match_.token == address(0)) {
            if (msg.value != match_.stake) revert InvalidStake();
        } else {
            if (msg.value != 0) revert InvalidStake();
            IERC20(match_.token).safeTransferFrom(msg.sender, address(this), match_.stake);
        }

        match_.opponent = msg.sender;
        match_.state = MatchState.Joined;
        match_.commitDeadline = uint64(block.timestamp + COMMIT_DURATION);

        playerMatches[msg.sender].push(matchId);

        emit MatchJoined(matchId, msg.sender, match_.commitDeadline);
    }

    /*//////////////////////////////////////////////////////////////
                            COMMIT PHASE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Commit choices for penalty shots
     * @param matchId The match ID
     * @param commitment The commitment hash
     */
    function commitChoices(uint256 matchId, bytes32 commitment)
        external
        whenNotPaused
        validMatch(matchId)
        onlyMatchPlayer(matchId)
    {
        Match storage match_ = matches[matchId];
        
        if (match_.state != MatchState.Joined) revert InvalidMatchState();
        if (block.timestamp > match_.commitDeadline) revert DeadlineExpired();
        if (commitment == bytes32(0)) revert InvalidCommitment();

        bool isCreator = msg.sender == match_.creator;
        
        if (isCreator) {
            if (match_.creatorCommitted) revert AlreadyCommitted();
            match_.creatorCommitment = commitment;
            match_.creatorCommitted = true;
        } else {
            if (match_.opponentCommitted) revert AlreadyCommitted();
            match_.opponentCommitment = commitment;
            match_.opponentCommitted = true;
        }

        emit ChoicesCommitted(matchId, msg.sender, commitment);

        // If both players committed, start reveal window
        if (match_.creatorCommitted && match_.opponentCommitted) {
            match_.state = MatchState.Committed;
            _startRevealWindow(matchId);
        }
    }

    /**
     * @notice Start the reveal window (internal)
     * @param matchId The match ID
     */
    function _startRevealWindow(uint256 matchId) internal {
        Match storage match_ = matches[matchId];
        match_.state = MatchState.RevealWindow;
        match_.revealDeadline = uint64(block.timestamp + REVEAL_DURATION);
        
        emit RevealWindowStarted(matchId, match_.revealDeadline);
    }

    /*//////////////////////////////////////////////////////////////
                            REVEAL PHASE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Reveal committed choices
     * @param matchId The match ID
     * @param choices Packed choices for 3 rounds (2 bits each)
     * @param salt Random salt used in commitment
     */
    function revealChoices(
        uint256 matchId,
        uint8 choices,
        uint256 salt
    ) external whenNotPaused validMatch(matchId) onlyMatchPlayer(matchId) {
        Match storage match_ = matches[matchId];
        
        if (match_.state != MatchState.RevealWindow) revert InvalidMatchState();
        if (block.timestamp > match_.revealDeadline) revert DeadlineExpired();
        
        // Validate choices (each 2-bit value should be 0, 1, or 2)
        if (!_isValidChoices(choices)) revert InvalidChoice();

        bool isCreator = msg.sender == match_.creator;
        bytes32 expectedCommitment = _computeCommitment(choices, salt, msg.sender);
        
        if (isCreator) {
            if (match_.creatorRevealed) revert AlreadyRevealed();
            if (expectedCommitment != match_.creatorCommitment) revert InvalidReveal();
            match_.creatorChoices = choices;
            match_.creatorRevealed = true;
        } else {
            if (match_.opponentRevealed) revert AlreadyRevealed();
            if (expectedCommitment != match_.opponentCommitment) revert InvalidReveal();
            match_.opponentChoices = choices;
            match_.opponentRevealed = true;
        }

        emit ChoicesRevealed(matchId, msg.sender, choices);

        // If both players revealed, settle the match
        if (match_.creatorRevealed && match_.opponentRevealed) {
            _settleMatch(matchId);
        }
    }

    /**
     * @notice Validate packed choices
     * @param choices Packed choices (2 bits per round)
     * @return valid True if all choices are valid (0, 1, or 2)
     */
    function _isValidChoices(uint8 choices) internal pure returns (bool valid) {
        for (uint8 i = 0; i < ROUNDS; i++) {
            uint8 choice = (choices >> (i * 2)) & 3;
            if (choice > 2) return false;
        }
        return true;
    }

    /**
     * @notice Compute commitment hash
     * @param choices Packed choices
     * @param salt Random salt
     * @param player Player address
     * @return commitment The commitment hash
     */
    function _computeCommitment(
        uint8 choices,
        uint256 salt,
        address player
    ) internal pure returns (bytes32 commitment) {
        return keccak256(abi.encodePacked(choices, salt, player));
    }

    /*//////////////////////////////////////////////////////////////
                            SETTLEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Settle the match and determine winner
     * @param matchId The match ID
     */
    function _settleMatch(uint256 matchId) internal {
        Match storage match_ = matches[matchId];
        
        uint8 creatorScore = 0;
        uint8 opponentScore = 0;

        // Score each round: keeper wins if they guess shooter's direction
        for (uint8 round = 0; round < ROUNDS; round++) {
            uint8 shooterChoice = (match_.creatorChoices >> (round * 2)) & 3;
            uint8 keeperChoice = (match_.opponentChoices >> (round * 2)) & 3;
            
            if (keeperChoice == shooterChoice) {
                opponentScore++; // Keeper (opponent) wins round
            } else {
                creatorScore++; // Shooter (creator) wins round
            }
        }

        // Determine overall winner (best of 3)
        if (creatorScore > opponentScore) {
            match_.winner = match_.creator;
        } else if (opponentScore > creatorScore) {
            match_.winner = match_.opponent;
        } else {
            // Tie - refund both players (rare case)
            match_.winner = address(0);
        }

        match_.state = MatchState.Settled;

        emit MatchSettled(matchId, match_.winner, creatorScore, opponentScore);
    }

    /**
     * @notice Manually settle match if reveal deadline passed
     * @param matchId The match ID
     */
    function settleMatch(uint256 matchId) 
        external 
        whenNotPaused 
        validMatch(matchId) 
    {
        Match storage match_ = matches[matchId];
        
        if (match_.state != MatchState.RevealWindow) revert InvalidMatchState();
        if (block.timestamp <= match_.revealDeadline) revert DeadlineNotReached();

        // Handle timeout scenarios
        if (match_.creatorRevealed && !match_.opponentRevealed) {
            // Creator revealed, opponent didn't - creator wins
            match_.winner = match_.creator;
        } else if (!match_.creatorRevealed && match_.opponentRevealed) {
            // Opponent revealed, creator didn't - opponent wins
            match_.winner = match_.opponent;
        } else if (!match_.creatorRevealed && !match_.opponentRevealed) {
            // Neither revealed - cancel match
            match_.state = MatchState.Cancelled;
            emit MatchCancelled(matchId, msg.sender, "Both players failed to reveal");
            return;
        } else {
            // Both revealed - normal settlement
            _settleMatch(matchId);
            return;
        }

        match_.state = MatchState.Settled;
        emit MatchSettled(matchId, match_.winner, 0, 0);
    }

    /*//////////////////////////////////////////////////////////////
                            CLAIMING
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Claim prize after match settlement
     * @param matchId The match ID
     */
    function claim(uint256 matchId) 
        external 
        whenNotPaused 
        nonReentrant 
        validMatch(matchId) 
    {
        Match storage match_ = matches[matchId];
        
        if (match_.state == MatchState.Cancelled) {
            _handleCancelledClaim(matchId);
        } else if (match_.state == MatchState.Settled) {
            _handleSettledClaim(matchId);
        } else {
            revert InvalidMatchState();
        }
    }

    /**
     * @notice Handle claim for cancelled matches
     * @param matchId The match ID
     */
    function _handleCancelledClaim(uint256 matchId) internal {
        Match storage match_ = matches[matchId];
        
        uint256 refundAmount = match_.stake;
        
        if (msg.sender == match_.creator) {
            match_.creator = address(0); // Mark as claimed
        } else if (msg.sender == match_.opponent) {
            match_.opponent = address(0); // Mark as claimed
        } else {
            revert InvalidPlayer();
        }

        _transferPayout(match_.token, payable(msg.sender), refundAmount);
        
        emit PrizeClaimed(matchId, msg.sender, refundAmount);
    }

    /**
     * @notice Handle claim for settled matches
     * @param matchId The match ID
     */
    function _handleSettledClaim(uint256 matchId) internal {
        Match storage match_ = matches[matchId];
        
        uint256 totalPot = uint256(match_.stake) * 2;
        uint256 protocolFee = (totalPot * match_.feeBps) / 10000;
        uint256 netPot = totalPot - protocolFee;

        if (match_.winner == address(0)) {
            // Tie - refund both players equally
            uint256 refundAmount = netPot / 2;
            
            if (msg.sender == match_.creator) {
                match_.creator = address(0); // Mark as claimed
            } else if (msg.sender == match_.opponent) {
                match_.opponent = address(0); // Mark as claimed
            } else {
                revert InvalidPlayer();
            }
            
            _transferPayout(match_.token, payable(msg.sender), refundAmount);
            emit PrizeClaimed(matchId, msg.sender, refundAmount);
            
        } else if (msg.sender == match_.winner) {
            // Winner takes all (minus fee)
            match_.winner = address(0); // Mark as claimed
            
            _transferPayout(match_.token, payable(msg.sender), netPot);
            emit PrizeClaimed(matchId, msg.sender, netPot);
            
        } else {
            revert InvalidPlayer();
        }

        // Accumulate protocol fee
        if (protocolFee > 0) {
            protocolFees[match_.token] += protocolFee;
        }
    }

    /**
     * @notice Transfer payout to player
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _transferPayout(address token, address payable to, uint256 amount) internal {
        if (token == address(0)) {
            to.safeTransferETH(amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            CANCELLATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Cancel match due to timeout or no opponent
     * @param matchId The match ID
     */
    function cancelMatch(uint256 matchId) 
        external 
        whenNotPaused 
        validMatch(matchId) 
    {
        Match storage match_ = matches[matchId];
        
        if (match_.state == MatchState.Created) {
            // No opponent joined within timeout
            if (block.timestamp <= match_.joinDeadline) revert DeadlineNotReached();
            if (msg.sender != match_.creator) revert InvalidPlayer();
            
            match_.state = MatchState.Cancelled;
            emit MatchCancelled(matchId, msg.sender, "No opponent joined");
            
        } else if (match_.state == MatchState.Joined) {
            // Commit phase timeout
            if (block.timestamp <= match_.commitDeadline) revert DeadlineNotReached();
            
            match_.state = MatchState.Cancelled;
            emit MatchCancelled(matchId, msg.sender, "Commit phase timeout");
            
        } else {
            revert InvalidMatchState();
        }
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update protocol fee (owner only)
     * @param newFeeBps New fee in basis points
     */
    function setFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        
        uint16 oldFee = feeBps;
        feeBps = newFeeBps;
        
        emit FeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Withdraw accumulated protocol fees (owner only)
     * @param token Token address
     */
    function withdrawFees(address token) external onlyOwner nonReentrant {
        uint256 amount = protocolFees[token];
        if (amount == 0) revert NoFeesToWithdraw();
        
        protocolFees[token] = 0;
        
        _transferPayout(token, payable(owner()), amount);
        
        emit FeesWithdrawn(token, amount);
    }

    /**
     * @notice Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get match details
     * @param matchId The match ID
     * @return match_ The match data
     */
    function getMatch(uint256 matchId) external view returns (Match memory match_) {
        return matches[matchId];
    }

    /**
     * @notice Get player's active matches
     * @param player Player address
     * @return matchIds Array of match IDs
     */
    function getPlayerMatches(address player) external view returns (uint256[] memory matchIds) {
        return playerMatches[player];
    }

    /**
     * @notice Check if commitment is valid
     * @param choices Packed choices
     * @param salt Random salt
     * @param player Player address
     * @param commitment Expected commitment
     * @return valid True if commitment is valid
     */
    function verifyCommitment(
        uint8 choices,
        uint256 salt,
        address player,
        bytes32 commitment
    ) external pure returns (bool valid) {
        return _computeCommitment(choices, salt, player) == commitment;
    }

    /**
     * @notice Get current timestamp (for testing)
     * @return timestamp Current block timestamp
     */
    function getCurrentTimestamp() external view returns (uint256 timestamp) {
        return block.timestamp;
    }
}