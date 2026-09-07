import { resolveSupplierDetail } from '@/components/suppliers/detail/resolve-supplier';
import { resolveSupplierByIdOrNumber } from '@/components/suppliers/detail/resolve-supplier-db';
import SupplierContactsClient from '@/components/contacts/supplier-contacts-client';

export const dynamic = 'force-dynamic';

export default async function SupplierContactsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = resolveSupplierDetail(id);

    if (!supplier) {
        return (
            <SupplierContactsClient
                notFound
                supplier={{ id, supplierNumber: id, name: '' }}
            />
        );
    }

    const dbSupplier = await resolveSupplierByIdOrNumber(supplier.supplierNumber ?? id);
    const supplierUuid = dbSupplier?.id ?? (isUuid(supplier.id) ? supplier.id : id);

    return (
        <SupplierContactsClient
            supplier={{
                id: supplierUuid,
                supplierNumber: supplier.supplierNumber,
                name: supplier.name,
                countryCode: supplier.countryCode,
                countryName: supplier.countryName,
                city: supplier.city,
                website: supplier.website,
            }}
        />
    );
}

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
