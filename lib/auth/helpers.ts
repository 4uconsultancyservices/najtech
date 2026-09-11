import { auth } from './config';
import { redirect } from 'next/navigation';

export type UserRole = 'student' | 'mentor' | 'admin' | 'super_admin';

const roleHierarchy: Record<UserRole, number> = {
  student: 1,
  mentor: 2,
  admin: 3,
  super_admin: 4,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function hasRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function hasMinimumRole(userRole: UserRole | undefined, minimumRole: UserRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

export async function getAuthSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, role)) {
    redirect('/unauthorized');
  }
  return session;
}

export async function requireSuperAdmin() {
  return requireRole('super_admin');
}

export async function requireAdmin() {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;
  if (!hasRole(userRole, ['admin', 'super_admin'])) {
    redirect('/unauthorized');
  }
  return session;
}

export async function requireMentor() {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;
  if (!hasRole(userRole, ['mentor', 'admin', 'super_admin'])) {
    redirect('/unauthorized');
  }
  return session;
}

export async function requireStudent() {
  return requireAuth();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateCertificateNumber(): string {
  const prefix = 'IV';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
