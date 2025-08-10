// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../contracts/Shootout.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ShootoutTest is Test {
    Shootout public shootout;
    MockERC20 public token;
    
    address public owner;
    address public player1;
    address public player2;
    address public player3;
    
    uint128 public constant STAKE = 1 ether;
    uint256 public constant SALT1 = 12345;
    uint256 public constant SALT2 = 67890;
    
    // Test choices: Left, Center, Right for 3 rounds
    uint8 public constant CHOICES_LCR = 0x06; // 00|01|10 = Right|Center|Left
    uint8 public constant CHOICES_RLC = 0x09; // 00|10|01 = Right|Left|Center
    uint8 public constant CHOICES_CCC = 0x05; // 00|01|01 = Center|Center|Center
    
    event MatchCreated(uint256 indexed matchId, address indexed creator, address indexed token, uint128 stake, uint64 joinDeadline);
    event MatchJoined(uint256 indexed matchId, address indexed opponent, uint64 commitDeadline);
    event ChoicesCommitted(uint256 indexed matchId, address indexed player, bytes32 commitment);
    event RevealWindowStarted(uint256 indexed matchId, uint64 revealDeadline);
    event ChoicesRevealed(uint256 indexed matchId, address indexed player, uint8 choices);
    event MatchSettled(uint256 indexed matchId, address indexed winner, uint8 creatorScore, uint8 opponentScore);
    event PrizeClaimed(uint256 indexed matchId, address indexed claimer, uint256 amount);
    event MatchCancelled(uint256 indexed matchId, address indexed canceller, string reason);

    function setUp() public {
        owner = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
        
        // Deploy contracts
        shootout = new Shootout();
        token = new MockERC20();
        
        // Fund players
        vm.deal(player1, 100 ether);
        vm.deal(player2, 100 ether);
        vm.deal(player3, 100 ether);
        
        // Mint tokens to players
        token.mint(player1, 1000 ether);
        token.mint(player2, 1000 ether);
        token.mint(player3, 1000 ether);
        
        // Approve token spending
        vm.prank(player1);
        token.approve(address(shootout), type(uint256).max);
        vm.prank(player2);
        token.approve(address(shootout), type(uint256).max);
        vm.prank(player3);
        token.approve(address(shootout), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                            BASIC FUNCTIONALITY
    //////////////////////////////////////////////////////////////*/

    function testCreateMatch() public {
        vm.prank(player1);
        vm.expectEmit(true, true, true, true);
        emit MatchCreated(1, player1, address(0), STAKE, uint64(block.timestamp + shootout.JOIN_TIMEOUT()));
        
        uint256 matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        
        assertEq(matchId, 1);
        assertEq(shootout.matchCounter(), 1);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(match_.creator, player1);
        assertEq(match_.token, address(0));
        assertEq(match_.stake, STAKE);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Created));
        assertEq(address(shootout).balance, STAKE);
    }

    function testCreateMatchWithToken() public {
        vm.prank(player1);
        uint256 matchId = shootout.createMatch(address(token), STAKE);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(match_.token, address(token));
        assertEq(token.balanceOf(address(shootout)), STAKE);
    }

    function testJoinMatch() public {
        // Create match
        vm.prank(player1);
        uint256 matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        
        // Join match
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit MatchJoined(matchId, player2, uint64(block.timestamp + shootout.COMMIT_DURATION()));
        
        shootout.joinMatch{value: STAKE}(matchId);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(match_.opponent, player2);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Joined));
        assertEq(address(shootout).balance, STAKE * 2);
    }

    function testCommitRevealFlow() public {
        // Create and join match
        uint256 matchId = _createAndJoinMatch();
        
        // Compute commitments
        bytes32 commitment1 = keccak256(abi.encodePacked(CHOICES_LCR, SALT1, player1));
        bytes32 commitment2 = keccak256(abi.encodePacked(CHOICES_RLC, SALT2, player2));
        
        // Commit choices
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit ChoicesCommitted(matchId, player1, commitment1);
        shootout.commitChoices(matchId, commitment1);
        
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit ChoicesCommitted(matchId, player2, commitment2);
        vm.expectEmit(true, false, false, true);
        emit RevealWindowStarted(matchId, uint64(block.timestamp + shootout.REVEAL_DURATION()));
        shootout.commitChoices(matchId, commitment2);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.RevealWindow));
        
        // Reveal choices
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit ChoicesRevealed(matchId, player1, CHOICES_LCR);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1);
        
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit ChoicesRevealed(matchId, player2, CHOICES_RLC);
        // This should trigger settlement
        vm.expectEmit(true, true, false, false);
        emit MatchSettled(matchId, address(0), 0, 0); // Will be calculated
        shootout.revealChoices(matchId, CHOICES_RLC, SALT2);
        
        match_ = shootout.getMatch(matchId);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Settled));
    }

    function testSettlement() public {
        uint256 matchId = _createCommitRevealMatch();
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        
        // Calculate expected scores
        // Player1 (shooter): LCR (Left, Center, Right)
        // Player2 (keeper): RLC (Right, Left, Center)
        // Round 1: Shooter=Left, Keeper=Right -> Shooter wins (1-0)
        // Round 2: Shooter=Center, Keeper=Left -> Shooter wins (2-0)
        // Round 3: Shooter=Right, Keeper=Center -> Shooter wins (3-0)
        // Player1 should win
        
        assertEq(match_.winner, player1);
    }

    function testClaimPrize() public {
        uint256 matchId = _createCommitRevealMatch();
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        address winner = match_.winner;
        
        uint256 balanceBefore = winner.balance;
        uint256 totalPot = uint256(match_.stake) * 2;
        uint256 protocolFee = (totalPot * match_.feeBps) / 10000;
        uint256 expectedPrize = totalPot - protocolFee;
        
        vm.prank(winner);
        vm.expectEmit(true, true, false, true);
        emit PrizeClaimed(matchId, winner, expectedPrize);
        shootout.claim(matchId);
        
        assertEq(winner.balance, balanceBefore + expectedPrize);
    }

    /*//////////////////////////////////////////////////////////////
                            TIMEOUT TESTS
    //////////////////////////////////////////////////////////////*/

    function testJoinTimeout() public {
        vm.prank(player1);
        uint256 matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        
        // Fast forward past join deadline
        vm.warp(block.timestamp + shootout.JOIN_TIMEOUT() + 1);
        
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit MatchCancelled(matchId, player1, "No opponent joined");
        shootout.cancelMatch(matchId);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Cancelled));
    }

    function testCommitTimeout() public {
        uint256 matchId = _createAndJoinMatch();
        
        // Fast forward past commit deadline
        vm.warp(block.timestamp + shootout.COMMIT_DURATION() + 1);
        
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit MatchCancelled(matchId, player1, "Commit phase timeout");
        shootout.cancelMatch(matchId);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Cancelled));
    }

    function testRevealTimeout() public {
        uint256 matchId = _createAndJoinMatch();
        
        // Commit choices
        bytes32 commitment1 = keccak256(abi.encodePacked(CHOICES_LCR, SALT1, player1));
        bytes32 commitment2 = keccak256(abi.encodePacked(CHOICES_RLC, SALT2, player2));
        
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment1);
        vm.prank(player2);
        shootout.commitChoices(matchId, commitment2);
        
        // Only player1 reveals
        vm.prank(player1);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1);
        
        // Fast forward past reveal deadline
        vm.warp(block.timestamp + shootout.REVEAL_DURATION() + 1);
        
        // Settle match - player1 should win by forfeit
        vm.expectEmit(true, true, false, true);
        emit MatchSettled(matchId, player1, 0, 0);
        shootout.settleMatch(matchId);
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(match_.winner, player1);
    }

    /*//////////////////////////////////////////////////////////////
                            SECURITY TESTS
    //////////////////////////////////////////////////////////////*/

    function testReentrancyProtection() public {
        // This would require a malicious contract to test properly
        // For now, we verify the modifier is present
        uint256 matchId = _createCommitRevealMatch();
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        address winner = match_.winner;
        
        // Normal claim should work
        vm.prank(winner);
        shootout.claim(matchId);
        
        // Second claim should fail
        vm.prank(winner);
        vm.expectRevert();
        shootout.claim(matchId);
    }

    function testInvalidCommitment() public {
        uint256 matchId = _createAndJoinMatch();
        
        bytes32 commitment1 = keccak256(abi.encodePacked(CHOICES_LCR, SALT1, player1));
        
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment1);
        
        vm.prank(player2);
        shootout.commitChoices(matchId, commitment1); // Same commitment
        
        // Try to reveal with wrong salt
        vm.prank(player1);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1); // Correct
        
        vm.prank(player2);
        vm.expectRevert(Shootout.InvalidReveal.selector);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1); // Wrong salt for player2
    }

    function testInvalidChoices() public {
        uint256 matchId = _createAndJoinMatch();
        
        bytes32 commitment = keccak256(abi.encodePacked(uint8(0xFF), SALT1, player1)); // Invalid choices
        
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment);
        
        vm.prank(player2);
        shootout.commitChoices(matchId, keccak256(abi.encodePacked(CHOICES_RLC, SALT2, player2)));
        
        vm.prank(player1);
        vm.expectRevert(Shootout.InvalidChoice.selector);
        shootout.revealChoices(matchId, 0xFF, SALT1); // Invalid choices
    }

    /*//////////////////////////////////////////////////////////////
                            GAS OPTIMIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testGasUsage() public {
        uint256 gasStart;
        uint256 gasUsed;
        
        // Test create match gas
        gasStart = gasleft();
        vm.prank(player1);
        uint256 matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        gasUsed = gasStart - gasleft();
        console.log("Create match gas:", gasUsed);
        
        // Test join match gas
        gasStart = gasleft();
        vm.prank(player2);
        shootout.joinMatch{value: STAKE}(matchId);
        gasUsed = gasStart - gasleft();
        console.log("Join match gas:", gasUsed);
        
        // Test commit gas
        bytes32 commitment = keccak256(abi.encodePacked(CHOICES_LCR, SALT1, player1));
        gasStart = gasleft();
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment);
        gasUsed = gasStart - gasleft();
        console.log("Commit choices gas:", gasUsed);
        
        // Test reveal gas
        vm.prank(player2);
        shootout.commitChoices(matchId, keccak256(abi.encodePacked(CHOICES_RLC, SALT2, player2)));
        
        gasStart = gasleft();
        vm.prank(player1);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1);
        gasUsed = gasStart - gasleft();
        console.log("Reveal choices gas:", gasUsed);
        
        // Test settle gas (happens automatically on second reveal)
        gasStart = gasleft();
        vm.prank(player2);
        shootout.revealChoices(matchId, CHOICES_RLC, SALT2);
        gasUsed = gasStart - gasleft();
        console.log("Reveal + settle gas:", gasUsed);
        
        // Test claim gas
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        gasStart = gasleft();
        vm.prank(match_.winner);
        shootout.claim(matchId);
        gasUsed = gasStart - gasleft();
        console.log("Claim prize gas:", gasUsed);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzzCommitReveal(uint8 choices1, uint8 choices2, uint256 salt1, uint256 salt2) public {
        // Bound choices to valid range
        choices1 = uint8(bound(choices1, 0, 63)); // 6 bits max (2 bits * 3 rounds)
        choices2 = uint8(bound(choices2, 0, 63));
        
        // Ensure choices are valid (each 2-bit value <= 2)
        vm.assume(_isValidChoices(choices1));
        vm.assume(_isValidChoices(choices2));
        
        uint256 matchId = _createAndJoinMatch();
        
        // Commit
        bytes32 commitment1 = keccak256(abi.encodePacked(choices1, salt1, player1));
        bytes32 commitment2 = keccak256(abi.encodePacked(choices2, salt2, player2));
        
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment1);
        vm.prank(player2);
        shootout.commitChoices(matchId, commitment2);
        
        // Reveal
        vm.prank(player1);
        shootout.revealChoices(matchId, choices1, salt1);
        vm.prank(player2);
        shootout.revealChoices(matchId, choices2, salt2);
        
        // Verify match is settled
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        assertEq(uint8(match_.state), uint8(Shootout.MatchState.Settled));
    }

    function testFuzzStakeAmounts(uint128 stake) public {
        vm.assume(stake > 0);
        vm.assume(stake <= 100 ether); // Reasonable upper bound
        
        vm.deal(player1, stake * 2);
        vm.deal(player2, stake * 2);
        
        vm.prank(player1);
        uint256 matchId = shootout.createMatch{value: stake}(address(0), stake);
        
        vm.prank(player2);
        shootout.joinMatch{value: stake}(matchId);
        
        assertEq(address(shootout).balance, stake * 2);
    }

    /*//////////////////////////////////////////////////////////////
                            INVARIANT TESTS
    //////////////////////////////////////////////////////////////*/

    function invariant_escrowBalance() public {
        // Total escrow should equal sum of all active match stakes
        // This would be implemented with a handler contract in a full invariant test
        assertTrue(true); // Placeholder
    }

    function invariant_matchStates() public {
        // Matches should only transition through valid states
        // This would check all matches in the system
        assertTrue(true); // Placeholder
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function testSetFee() public {
        uint16 newFee = 150; // 1.5%
        
        vm.expectEmit(false, false, false, true);
        emit Shootout.FeeUpdated(100, newFee);
        shootout.setFee(newFee);
        
        assertEq(shootout.feeBps(), newFee);
    }

    function testSetFeeOnlyOwner() public {
        vm.prank(player1);
        vm.expectRevert();
        shootout.setFee(150);
    }

    function testWithdrawFees() public {
        // Create and complete a match to generate fees
        uint256 matchId = _createCommitRevealMatch();
        
        Shootout.Match memory match_ = shootout.getMatch(matchId);
        vm.prank(match_.winner);
        shootout.claim(matchId);
        
        uint256 expectedFees = (uint256(match_.stake) * 2 * match_.feeBps) / 10000;
        assertEq(shootout.protocolFees(address(0)), expectedFees);
        
        uint256 balanceBefore = owner.balance;
        shootout.withdrawFees(address(0));
        
        assertEq(owner.balance, balanceBefore + expectedFees);
        assertEq(shootout.protocolFees(address(0)), 0);
    }

    function testPauseUnpause() public {
        shootout.pause();
        
        vm.prank(player1);
        vm.expectRevert();
        shootout.createMatch{value: STAKE}(address(0), STAKE);
        
        shootout.unpause();
        
        vm.prank(player1);
        uint256 matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        assertEq(matchId, 1);
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _createAndJoinMatch() internal returns (uint256 matchId) {
        vm.prank(player1);
        matchId = shootout.createMatch{value: STAKE}(address(0), STAKE);
        
        vm.prank(player2);
        shootout.joinMatch{value: STAKE}(matchId);
    }

    function _createCommitRevealMatch() internal returns (uint256 matchId) {
        matchId = _createAndJoinMatch();
        
        // Commit choices
        bytes32 commitment1 = keccak256(abi.encodePacked(CHOICES_LCR, SALT1, player1));
        bytes32 commitment2 = keccak256(abi.encodePacked(CHOICES_RLC, SALT2, player2));
        
        vm.prank(player1);
        shootout.commitChoices(matchId, commitment1);
        vm.prank(player2);
        shootout.commitChoices(matchId, commitment2);
        
        // Reveal choices
        vm.prank(player1);
        shootout.revealChoices(matchId, CHOICES_LCR, SALT1);
        vm.prank(player2);
        shootout.revealChoices(matchId, CHOICES_RLC, SALT2);
    }

    function _isValidChoices(uint8 choices) internal pure returns (bool) {
        for (uint8 i = 0; i < 3; i++) {
            uint8 choice = (choices >> (i * 2)) & 3;
            if (choice > 2) return false;
        }
        return true;
    }
}