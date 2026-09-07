export type SupplierPermission =
    | "suppliers.view"
    | "suppliers.create"
    | "suppliers.import"
    | "suppliers.edit"
    | "suppliers.delete"
    | "suppliers.manageViews"
    | "suppliers.manageTableSettings"
    | "suppliers.export";

export type SupplierRole = "admin" | "user";

/**
 * Role-based defaults for the Suppliers module.
 * `admin` gets full control. `user` is read-only with export only —
 * restricted controls (create, import, edit, delete, view/table settings)
 * are removed from the DOM entirely for this role.
 */
export const SUPPLIER_ROLE_DEFAULTS: Record<SupplierRole, SupplierPermission[]> = {
    admin: [
        "suppliers.view",
        "suppliers.create",
        "suppliers.import",
        "suppliers.edit",
        "suppliers.delete",
        "suppliers.manageViews",
        "suppliers.manageTableSettings",
        "suppliers.export",
    ],
    user: ["suppliers.view", "suppliers.export"],
};

export function getSupplierPermissions(role?: string | null): SupplierPermission[] {
    if (role === "admin") return SUPPLIER_ROLE_DEFAULTS.admin;
    if (role === "user") return SUPPLIER_ROLE_DEFAULTS.user;
    // Suppliers (portal) and unknown roles get the least privileged set.
    return SUPPLIER_ROLE_DEFAULTS.user;
}

export function hasSupplierPermission(role?: string | null, permission?: SupplierPermission | null): boolean {
    if (!permission) return false;
    return getSupplierPermissions(role).includes(permission);
}
