'use client'

import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getAccessProfileLabel, getAllowedAccessProfilesForRole, type AccessProfile } from "@/lib/rbac";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";
import {
    Briefcase,
    Building2,
    Plus,
    Shield as ShieldIcon,
    Store,
    UserCheck,
    UserRound,
    Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

type UserRole = 'admin' | 'user' | 'supplier';

interface AppUser {
    id: string;
    name: string;
    email: string;
    employeeId: string | null;
    department: string | null;
    role: UserRole | null;
    accessProfile: string | null;
    countryScope: string | null;
    regionScope: string | null;
    supplierId: string | null;
    supplierName: string | null;
    createdAt: Date | null;
}

interface SupplierOption {
    id: string;
    name: string;
}

const DEPARTMENTS = [
    "Finance & Budgeting",
    "Supplier Operations",
    "Procurement Team",
    "Inventory Control",
    "IT & Admin",
    "Executive Leadership",
];

interface UsersClientProps {
    users: AppUser[];
    suppliers: SupplierOption[];
    currentUserRole: string;
}

function roleBadgeClass(role: UserRole | null) {
    if (role === 'admin') return "bg-amber-100 text-amber-700 border-amber-200";
    if (role === 'supplier') return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
}

function accessLabel(user: AppUser) {
    if (user.role === 'admin') {
        return getAccessProfileLabel((user.accessProfile as AccessProfile | null) || "super_admin");
    }

    if (user.role === 'supplier') {
        return user.supplierName ? `Supplier Portal: ${user.supplierName}` : "Supplier Portal";
    }

    return user.accessProfile === "regional_operator" ? "Regional Operator" : "Internal Workspace";
}

function scopeLabel(user: AppUser) {
    return [user.countryScope, user.regionScope].filter(Boolean).join(" / ");
}

function getDefaultAccessProfile(role: UserRole) {
    return getAllowedAccessProfilesForRole(role)[0];
}

export default function UsersClient({ users, suppliers, currentUserRole }: UsersClientProps) {
    const { language } = useLanguage();
    const tc = t(language, "misc");
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState<AppUser | null>(null);
    const [createRole, setCreateRole] = useState<UserRole>('user');
    const [createAccessProfile, setCreateAccessProfile] = useState<AccessProfile>('internal_user');
    const [createSupplierId, setCreateSupplierId] = useState('');
    const [editRole, setEditRole] = useState<UserRole>('user');
    const [editAccessProfile, setEditAccessProfile] = useState<AccessProfile>('internal_user');
    const [editSupplierId, setEditSupplierId] = useState('');
    const [isPending, startTransition] = useTransition();

    const adminCount = users.filter((user) => user.role === 'admin').length;
    const internalUserCount = users.filter((user) => user.role === 'user').length;
    const supplierAccountCount = users.filter((user) => user.role === 'supplier').length;
    const scopedOperatorCount = users.filter((user) => user.accessProfile === 'regional_operator').length;

    const createAccessProfiles = getAllowedAccessProfilesForRole(createRole);
    const editAccessProfiles = getAllowedAccessProfilesForRole(editRole);

    const resetCreateState = () => {
        setCreateRole('user');
        setCreateAccessProfile('internal_user');
        setCreateSupplierId('');
    };

    const handleCreateUser = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createUser(formData);
            if (result.success) {
            toast.success(tc.accessCreated);
            setOpen(false);
            resetCreateState();
        } else {
            toast.error(result.error || tc.createUserFailed);
            }
        });
    };

    const handleUpdateUser = async (formData: FormData) => {
        if (!editUser) return;
        startTransition(async () => {
            const result = await updateUser(editUser.id, formData);
            if (result.success) {
            toast.success(tc.accessUpdated);
            setEditUser(null);
        } else {
            toast.error(result.error || tc.updateUserFailed);
            }
        });
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm(tc.deleteConfirm)) {
            return;
        }

        startTransition(async () => {
            const result = await deleteUser(id);
            if (result.success) {
            toast.success(tc.accessRemoved);
        } else {
            toast.error(result.error || tc.deleteUserFailed);
            }
        });
    };

    const openEditDialog = (user: AppUser) => {
        setEditUser(user);
        setEditRole((user.role || 'user') as UserRole);
        setEditAccessProfile((user.accessProfile as AccessProfile | null) || getDefaultAccessProfile((user.role || 'user') as UserRole));
        setEditSupplierId(user.supplierId || '');
    };

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-slate-900">{tc.usersTitle}</h1>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">{tc.usersSubtitle}</p>
                </div>

                {currentUserRole === 'admin' && (
                    <Dialog
                        open={open}
                        onOpenChange={(nextOpen) => {
                            setOpen(nextOpen);
                            if (!nextOpen) {
                                resetCreateState();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-amber-600 shadow-lg shadow-amber-100 transition-all hover:bg-amber-700">
                                <Plus className="mr-1 h-4 w-4" />
                                {tc.addAccount}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{tc.createAccessAccount}</DialogTitle>
                                <DialogDescription>
                                    {tc.createAccessDesc}
                                </DialogDescription>
                            </DialogHeader>
                            <form action={handleCreateUser} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{tc.fullName}</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{tc.email}</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="employeeId">{tc.employeeId}</Label>
                                    <Input id="employeeId" name="employeeId" placeholder="EMP001" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">{tc.password}</Label>
                                    <Input id="password" name="password" type="password" placeholder="Minimum 6 characters" required minLength={6} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="department">{tc.department}</Label>
                                    <select
                                        id="department"
                                        name="department"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">{tc.selectDepartment}</option>
                                        {DEPARTMENTS.map((department) => (
                                            <option key={department} value={department}>{department}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">{tc.role}</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={createRole}
                                        onChange={(event) => {
                                            const nextRole = event.target.value as UserRole;
                                            setCreateRole(nextRole);
                                            setCreateAccessProfile(getDefaultAccessProfile(nextRole));
                                            if (nextRole !== 'supplier') {
                                                setCreateSupplierId('');
                                            }
                                        }}
                                    >
                                        <option value="user">{tc.internalUser}</option>
                                        <option value="admin">{tc.admin}</option>
                                        <option value="supplier" disabled={suppliers.length === 0}>{tc.supplier}</option>
                                    </select>
                                </div>
                                {createRole === 'supplier' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="supplierId">{tc.linkedSupplier}</Label>
                                        <select
                                            id="supplierId"
                                            name="supplierId"
                                            required
                                            value={createSupplierId}
                                            onChange={(event) => setCreateSupplierId(event.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">{tc.selectSupplier}</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}
                                        </select>
                                            <p className="text-[11px] text-muted-foreground">
                                                {tc.supplierMappingNote}
                                            </p>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="accessProfile">{tc.accessProfile}</Label>
                                    <select
                                        id="accessProfile"
                                        name="accessProfile"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={createAccessProfile}
                                        onChange={(event) => setCreateAccessProfile(event.target.value as AccessProfile)}
                                    >
                                        {createAccessProfiles.map((profile) => (
                                            <option key={profile} value={profile}>{getAccessProfileLabel(profile)}</option>
                                        ))}
                                    </select>
                                </div>
                                {createAccessProfile === 'regional_operator' && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="countryScope">{tc.countryScope}</Label>
                                            <Input id="countryScope" name="countryScope" placeholder="DE, IN, US..." />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="regionScope">{tc.regionScope}</Label>
                                            <Input id="regionScope" name="regionScope" placeholder="EMEA, APAC, Bavaria..." />
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                                        {tc.createAccount}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="glass-card border-l-4 border-l-indigo-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc.totalAccounts}</CardTitle>
                        <UsersIcon className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{users.length}</div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{tc.authorizedIdentities}</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc.admins}</CardTitle>
                        <ShieldIcon className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{adminCount}</div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{tc.controlPlaneAccounts}</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc.internalUsers}</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{internalUserCount}</div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{tc.operationalWorkspaceAccounts}</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-l-4 border-l-cyan-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc.regionalScope}</CardTitle>
                        <Building2 className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{scopedOperatorCount}</div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{tc.countryRegionOperators}</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc.supplierLogins}</CardTitle>
                        <Store className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{supplierAccountCount}</div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{tc.portalOnlyExternal}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card overflow-hidden border-none shadow-2xl">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-6 dark:bg-slate-900/50">
                    <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter text-slate-900">
                        <UserCheck className="h-5 w-5 text-indigo-600" />
                        {tc.directory}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {tc.directoryDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thName}</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thEmail}</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thAccessScope}</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thDepartment}</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thRole}</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{tc.thCreated}</th>
                                        {currentUserRole === 'admin' && (
                                            <th className="h-12 px-8 text-right align-middle font-medium text-muted-foreground">{tc.thActions}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-lg border",
                                                        user.role === 'admin'
                                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                                            : user.role === 'supplier'
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border-blue-200 bg-blue-50 text-blue-700",
                                                    )}>
                                                        {user.role === 'admin'
                                                            ? <ShieldIcon className="h-4 w-4" />
                                                            : user.role === 'supplier'
                                                                ? <Store className="h-4 w-4" />
                                                                : <UserRound className="h-4 w-4" />}
                                                    </span>
                                                    <div>
                                                        <p>{user.name}</p>
                                                        {user.employeeId ? <p className="font-mono text-[11px] text-muted-foreground">{user.employeeId}</p> : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-mono text-xs">{user.email}</td>
                                            <td className="p-4 align-middle text-xs">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit bg-muted/50 font-normal">
                                                        {accessLabel(user)}
                                                    </Badge>
                                                    {scopeLabel(user) ? (
                                                        <span className="text-[11px] text-muted-foreground">{scopeLabel(user)}</span>
                                                    ) : null}
                                                        {user.role === 'supplier' && !user.supplierName ? (
                                                            <span className="text-[11px] text-red-500">{tc.supplierMappingRequired}</span>
                                                        ) : null}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-xs">
                                                {user.department ? (
                                                    <Badge variant="outline" className="bg-muted/50 font-normal">
                                                        <Building2 className="mr-1 h-3 w-3" />
                                                        {user.department}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle capitalize">
                                                <Badge className={cn("rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest", roleBadgeClass(user.role))}>
                                                    <ShieldIcon className="mr-1 h-3 w-3" />
                                                    {user.role || 'user'}
                                                </Badge>
                                                {user.role !== 'supplier' ? (
                                                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                                        {getAccessProfileLabel((user.accessProfile as AccessProfile | null) || 'internal_user')}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                            </td>
                                            {currentUserRole === 'admin' && (
                                                <td className="p-4 px-8 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(user)}
                                                            className="rounded-lg font-bold text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-900"
                                                        >
                                                            {tc.edit}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={isPending}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            {tc.delete}
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-muted-foreground">{tc.noUsersFound}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={!!editUser}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setEditUser(null);
                        setEditRole('user');
                        setEditAccessProfile('internal_user');
                        setEditSupplierId('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tc.editAccessAccount}</DialogTitle>
                        <DialogDescription>
                            {tc.editAccessDesc.replace("{name}", editUser?.name || "")}
                        </DialogDescription>
                    </DialogHeader>
                    {editUser && (
                        <form action={handleUpdateUser} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">{tc.fullName}</Label>
                                <Input id="edit-name" name="name" defaultValue={editUser.name} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">{tc.email}</Label>
                                <Input id="edit-email" name="email" type="email" defaultValue={editUser.email} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-employeeId">{tc.employeeId}</Label>
                                <Input id="edit-employeeId" name="employeeId" defaultValue={editUser.employeeId || ''} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-password">{tc.newPassword}</Label>
                                <Input id="edit-password" name="password" type="password" placeholder="Minimum 6 characters" minLength={6} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-department">{tc.department}</Label>
                                <select
                                    id="edit-department"
                                    name="department"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={editUser.department || ''}
                                >
                                    <option value="">{tc.selectDepartment}</option>
                                    {DEPARTMENTS.map((department) => (
                                        <option key={department} value={department}>{department}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">{tc.role}</Label>
                                <select
                                    id="edit-role"
                                    name="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editRole}
                                    onChange={(event) => {
                                        const nextRole = event.target.value as UserRole;
                                        setEditRole(nextRole);
                                        setEditAccessProfile(getDefaultAccessProfile(nextRole));
                                        if (nextRole !== 'supplier') {
                                            setEditSupplierId('');
                                        }
                                    }}
                                >
                                        <option value="user">{tc.internalUser}</option>
                                        <option value="admin">{tc.admin}</option>
                                        <option value="supplier" disabled={suppliers.length === 0}>{tc.supplier}</option>
                                </select>
                            </div>
                            {editRole === 'supplier' && (
                                <div className="grid gap-2">
                                        <Label htmlFor="edit-supplierId">{tc.linkedSupplier}</Label>
                                        <select
                                            id="edit-supplierId"
                                            name="supplierId"
                                            required
                                            value={editSupplierId}
                                            onChange={(event) => setEditSupplierId(event.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">{tc.selectSupplier}</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-accessProfile">{tc.accessProfile}</Label>
                                <select
                                    id="edit-accessProfile"
                                    name="accessProfile"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editAccessProfile}
                                    onChange={(event) => setEditAccessProfile(event.target.value as AccessProfile)}
                                >
                                    {editAccessProfiles.map((profile) => (
                                        <option key={profile} value={profile}>{getAccessProfileLabel(profile)}</option>
                                    ))}
                                </select>
                            </div>
                            {editAccessProfile === 'regional_operator' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-countryScope">{tc.countryScope}</Label>
                                        <Input id="edit-countryScope" name="countryScope" defaultValue={editUser.countryScope || ''} placeholder="DE, IN, US..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-regionScope">{tc.regionScope}</Label>
                                        <Input id="edit-regionScope" name="regionScope" defaultValue={editUser.regionScope || ''} placeholder="EMEA, APAC, Bavaria..." />
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                                    {tc.updateAccount}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
