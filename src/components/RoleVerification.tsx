import { useEffect, useState } from 'react';
import { useRoleManager } from '@/lib/roleManager';

interface RoleVerificationProps {
  matchId: string | string[] | undefined;
  currentRole: boolean; // true = shooter, false = keeper
  isFixed: boolean;
}

export default function RoleVerification({ matchId, currentRole, isFixed }: RoleVerificationProps) {
  const roleManager = useRoleManager(matchId);
  const [roleData, setRoleData] = useState({
    managerRole: '',
    localStorage: '',
    sessionStorage: '',
    backup: '',
    consistent: false,
    protected: false
  });

  useEffect(() => {
    if (!matchId || !roleManager) return;

    const checkRoles = () => {
      const managerRole = roleManager.getRole() || 'none';
      const localRole = localStorage.getItem(`match_${matchId}_player_role`) || 'none';
      const sessionRole = sessionStorage.getItem(`match_${matchId}_player_role`) || 'none';
      const backupRole = localStorage.getItem(`match_${matchId}_role_backup`) || 'none';
      
      const allMatch = managerRole === localRole && localRole === sessionRole && sessionRole === backupRole;
      const expectedRole = currentRole ? 'shooter' : 'keeper';
      const roleMatches = managerRole === expectedRole;
      const isProtected = roleManager.isRoleLocked();
      
      setRoleData({
        managerRole,
        localStorage: localRole,
        sessionStorage: sessionRole,
        backup: backupRole,
        consistent: allMatch && roleMatches && managerRole !== 'none',
        protected: isProtected
      });

      // Let role manager handle repairs
      if (!allMatch || !roleMatches) {
        roleManager.verifyAndRepair();
      }
    };

    checkRoles();
    const interval = setInterval(checkRoles, 2000);
    
    return () => clearInterval(interval);
  }, [matchId, currentRole, roleManager]);

  if (!isFixed || !roleManager) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-3 text-xs shadow-lg max-w-xs">
      <div className="font-bold mb-2 flex items-center">
        🔒 Role Manager Status
        <span className={`ml-2 w-2 h-2 rounded-full ${roleData.consistent && roleData.protected ? 'bg-green-500' : 'bg-red-500'}`}></span>
      </div>
      <div className="space-y-1 text-gray-600 dark:text-gray-300">
        <div>Current: {currentRole ? 'SHOOTER' : 'KEEPER'}</div>
        <div>Manager: {roleData.managerRole}</div>
        <div>Local: {roleData.localStorage}</div>
        <div>Session: {roleData.sessionStorage}</div>
        <div>Backup: {roleData.backup}</div>
        <div className={roleData.protected ? 'text-green-600' : 'text-red-600'}>
          {roleData.protected ? '🔒 Protected' : '⚠ Unprotected'}
        </div>
        <div className={roleData.consistent ? 'text-green-600' : 'text-red-600'}>
          {roleData.consistent ? '✓ Consistent' : '⚠ Inconsistent'}
        </div>
      </div>
    </div>
  );
}