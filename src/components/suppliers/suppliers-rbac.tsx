"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import {
    getSupplierPermissions,
    hasSupplierPermission,
    type SupplierPermission,
    type SupplierRole,
} from "@/lib/suppliers/rbac";

/**
 * Client-side permission hook backed by the next-auth session role.
 * Mirrors the server-side `getSupplierPermissions` used in actions.
 */
export function useSupplierPermission() {
    const { data: session, status } = useSession();
    const role: string | undefined = session?.user?.role;

    return {
        role: role as SupplierRole | undefined,
        status,
        permissions: getSupplierPermissions(role),
        can: (permission: SupplierPermission) => hasSupplierPermission(role, permission),
        canAny: (permissions: SupplierPermission[]) => permissions.some((permission) => hasSupplierPermission(role, permission)),
    };
}

export function Can({
    permission,
    children,
    fallback = null,
}: {
    permission: SupplierPermission;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const { can } = useSupplierPermission();
    return can(permission) ? <>{children}</> : <>{fallback}</>;
}

export function CanAny({
    permissions,
    children,
    fallback = null,
}: {
    permissions: SupplierPermission[];
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const { canAny } = useSupplierPermission();
    return canAny(permissions) ? <>{children}</> : <>{fallback}</>;
}
