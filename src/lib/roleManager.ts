/**
 * Role Manager - Ensures player roles are completely isolated from sync mechanisms
 * Roles are set once and never change, regardless of any external interference
 */

export type PlayerRole = 'shooter' | 'keeper';

export class RoleManager {
  private matchId: string;
  private role: PlayerRole | null = null;
  private isLocked = false;

  constructor(matchId: string) {
    this.matchId = matchId;
  }

  /**
   * Set the player role permanently - can only be called once
   */
  setRole(role: PlayerRole): boolean {
    if (this.isLocked) {
      console.warn('🔒 Role already locked, cannot change');
      return false;
    }

    this.role = role;
    this.isLocked = true;

    // Store in multiple locations for redundancy
    localStorage.setItem(`match_${this.matchId}_player_role`, role);
    sessionStorage.setItem(`match_${this.matchId}_player_role`, role);
    localStorage.setItem(`match_${this.matchId}_role_backup`, role);
    localStorage.setItem(`match_${this.matchId}_role_timestamp`, Date.now().toString());

    console.log(`🔒 Role PERMANENTLY set to: ${role.toUpperCase()}`);
    
    // Start protection mechanism
    this.startProtection();
    
    return true;
  }

  /**
   * Get the current role
   */
  getRole(): PlayerRole | null {
    if (this.role) return this.role;

    // Try to recover from storage
    const stored = localStorage.getItem(`match_${this.matchId}_player_role`) as PlayerRole;
    const session = sessionStorage.getItem(`match_${this.matchId}_player_role`) as PlayerRole;
    const backup = localStorage.getItem(`match_${this.matchId}_role_backup`) as PlayerRole;

    if (stored && (stored === 'shooter' || stored === 'keeper')) {
      this.role = stored;
      this.isLocked = true;
      this.startProtection();
      return stored;
    }

    return null;
  }

  /**
   * Check if role is locked
   */
  isRoleLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Force role verification and repair
   */
  verifyAndRepair(): boolean {
    if (!this.role) return false;

    const stored = localStorage.getItem(`match_${this.matchId}_player_role`);
    const session = sessionStorage.getItem(`match_${this.matchId}_player_role`);
    const backup = localStorage.getItem(`match_${this.matchId}_role_backup`);

    let repaired = false;

    if (stored !== this.role) {
      localStorage.setItem(`match_${this.matchId}_player_role`, this.role);
      repaired = true;
    }

    if (session !== this.role) {
      sessionStorage.setItem(`match_${this.matchId}_player_role`, this.role);
      repaired = true;
    }

    if (backup !== this.role) {
      localStorage.setItem(`match_${this.matchId}_role_backup`, this.role);
      repaired = true;
    }

    if (repaired) {
      console.log(`🔧 Role repaired to: ${this.role.toUpperCase()}`);
    }

    return repaired;
  }

  /**
   * Start continuous protection against role corruption
   */
  private startProtection(): void {
    // Check every second for role corruption
    setInterval(() => {
      this.verifyAndRepair();
    }, 1000);

    // Also protect against storage events that might affect roles
    const protectRole = (e: StorageEvent) => {
      if (e.key === `match_${this.matchId}_player_role` && e.newValue !== this.role) {
        console.log('🛡️ Blocking role change attempt');
        localStorage.setItem(`match_${this.matchId}_player_role`, this.role!);
      }
    };

    window.addEventListener('storage', protectRole);
  }

  /**
   * Clear all role data (for testing only)
   */
  clearRole(): void {
    localStorage.removeItem(`match_${this.matchId}_player_role`);
    sessionStorage.removeItem(`match_${this.matchId}_player_role`);
    localStorage.removeItem(`match_${this.matchId}_role_backup`);
    localStorage.removeItem(`match_${this.matchId}_role_timestamp`);
    this.role = null;
    this.isLocked = false;
    console.log('🧹 Role data cleared');
  }
}

// Global role managers cache
const roleManagers = new Map<string, RoleManager>();

/**
 * Get or create a role manager for a match
 */
export function getRoleManager(matchId: string): RoleManager {
  if (!roleManagers.has(matchId)) {
    roleManagers.set(matchId, new RoleManager(matchId));
  }
  return roleManagers.get(matchId)!;
}

/**
 * Hook for using role manager in React components
 */
export function useRoleManager(matchId: string | string[] | undefined) {
  if (!matchId) return null;
  const id = Array.isArray(matchId) ? matchId[0] : matchId;
  return getRoleManager(id);
}