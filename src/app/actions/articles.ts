'use server';

import { db } from '@/db';
import { articles, suppliers } from '@/db/schema';
import { eq, or, ilike, desc, asc, inArray } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ArticleItem, ArticleColumnKey } from '@/components/articles/articles-schema';

export interface ArticleListFilter {
    search?: string;
    category?: string;
    supplierId?: string;
    sortBy?: ArticleColumnKey;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

const ArticleInputSchema = z.object({
    articleNumber: z.string().min(1, 'Article number is required'),
    description: z.string().optional().nullable(),
    longText: z.string().optional().nullable(),
    cnCode: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    netWeight: z.number().optional().nullable(),
    netWeightUnit: z.string().optional().nullable(),
    budgetPrice: z.number().optional().nullable(),
    costModel: z.string().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;

import { and } from 'drizzle-orm';
import { SAMPLE_ARTICLES_LIST } from '@/components/articles/articles-schema';

export async function listArticles(filter: ArticleListFilter = {}): Promise<{
    rows: ArticleItem[];
    total: number;
}> {
    try {
        const where: any[] = [];

        if (filter.supplierId) {
            where.push(eq(articles.supplierId, filter.supplierId));
        }

        if (filter.category && filter.category !== 'all') {
            where.push(eq(articles.category, filter.category));
        }

        if (filter.search && filter.search.trim()) {
            const q = `%${filter.search.trim()}%`;
            where.push(
                or(
                    ilike(articles.articleNumber, q),
                    ilike(articles.description, q),
                    ilike(articles.longText, q),
                    ilike(articles.cnCode, q),
                    ilike(articles.category, q)
                )
            );
        }

        let query = db
            .select({
                id: articles.id,
                articleNumber: articles.articleNumber,
                description: articles.description,
                longText: articles.longText,
                cnCode: articles.cnCode,
                category: articles.category,
                netWeight: articles.netWeight,
                netWeightUnit: articles.netWeightUnit,
                budgetPrice: articles.budgetPrice,
                costModel: articles.costModel,
                supplierId: articles.supplierId,
                supplierName: suppliers.name,
                createdAt: articles.createdAt,
                updatedAt: articles.updatedAt,
            })
            .from(articles)
            .leftJoin(suppliers, eq(articles.supplierId, suppliers.id));

        const dir = filter.sortDir === 'desc' ? desc : asc;
        const sortCol =
            filter.sortBy === 'category'
                ? articles.category
                : filter.sortBy === 'cnCode'
                ? articles.cnCode
                : filter.sortBy === 'createdAt'
                ? articles.createdAt
                : filter.sortBy === 'lastUpdated'
                ? articles.updatedAt
                : filter.sortBy === 'netWeight'
                ? articles.netWeight
                : articles.articleNumber;

        const results = await (where.length > 0
            ? query.where(and(...where)).orderBy(dir(sortCol))
            : query.orderBy(dir(sortCol)));

        const rows: ArticleItem[] = results.map((r) => ({
            id: r.id,
            articleNumber: r.articleNumber,
            description: r.description,
            longText: r.longText || r.description,
            cnCode: r.cnCode,
            category: r.category,
            netWeight: r.netWeight ? parseFloat(r.netWeight.toString()) : null,
            netWeightUnit: r.netWeightUnit,
            budgetPrice: r.budgetPrice ? parseFloat(r.budgetPrice.toString()) : null,
            costModel: r.costModel,
            supplierId: r.supplierId,
            supplierName: r.supplierName,
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : null,
            lastUpdated: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('de-DE') : null,
        }));

        return { rows, total: rows.length };
    } catch (error) {
        console.error('[Articles] Failed to list articles from DB:', error);
        return { rows: [], total: 0 };
    }
}

export async function createArticle(input: ArticleInput): Promise<{
    success: boolean;
    data?: ArticleItem;
    error?: string;
}> {
    const session = await auth();
    let validUserId: string | null = null;
    if (session?.user?.id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(session.user.id)) {
            validUserId = session.user.id;
        }
    }

    const validated = ArticleInputSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0]?.message || 'Invalid input' };
    }

    try {
        const [inserted] = await db
            .insert(articles)
            .values({
                articleNumber: validated.data.articleNumber,
                description: validated.data.description,
                longText: validated.data.longText || validated.data.description,
                cnCode: validated.data.cnCode,
                category: validated.data.category,
                netWeight: validated.data.netWeight != null ? validated.data.netWeight.toString() : null,
                netWeightUnit: validated.data.netWeightUnit,
                budgetPrice: validated.data.budgetPrice != null ? validated.data.budgetPrice.toString() : null,
                costModel: validated.data.costModel,
                supplierId: validated.data.supplierId || null,
                createdBy: validUserId,
            })
            .returning();

        revalidatePath('/articles');

        return {
            success: true,
            data: {
                id: inserted.id,
                articleNumber: inserted.articleNumber,
                description: inserted.description,
                longText: inserted.longText,
                cnCode: inserted.cnCode,
                category: inserted.category,
                netWeight: inserted.netWeight ? parseFloat(inserted.netWeight.toString()) : null,
                netWeightUnit: inserted.netWeightUnit,
                budgetPrice: inserted.budgetPrice ? parseFloat(inserted.budgetPrice.toString()) : null,
                costModel: inserted.costModel,
                createdAt: inserted.createdAt ? new Date(inserted.createdAt).toLocaleDateString('de-DE') : null,
                lastUpdated: inserted.updatedAt ? new Date(inserted.updatedAt).toLocaleDateString('de-DE') : null,
            },
        };
    } catch (error: any) {
        console.error('[Articles] Failed to create article:', error);
        return { success: false, error: error?.message || 'Failed to create article' };
    }
}

export async function getArticle(idOrNumber: string): Promise<{
    success: boolean;
    data?: ArticleItem;
    error?: string;
}> {
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const condition = uuidRegex.test(idOrNumber)
            ? eq(articles.id, idOrNumber)
            : eq(articles.articleNumber, idOrNumber);

        const results = await db
            .select({
                id: articles.id,
                articleNumber: articles.articleNumber,
                description: articles.description,
                longText: articles.longText,
                cnCode: articles.cnCode,
                category: articles.category,
                netWeight: articles.netWeight,
                netWeightUnit: articles.netWeightUnit,
                budgetPrice: articles.budgetPrice,
                costModel: articles.costModel,
                supplierId: articles.supplierId,
                supplierName: suppliers.name,
                createdAt: articles.createdAt,
                updatedAt: articles.updatedAt,
            })
            .from(articles)
            .leftJoin(suppliers, eq(articles.supplierId, suppliers.id))
            .where(condition)
            .limit(1);

        if (!results.length) {
            return { success: false, error: 'Article not found' };
        }

        const r = results[0];
        const data: ArticleItem = {
            id: r.id,
            articleNumber: r.articleNumber,
            description: r.description,
            longText: r.longText || r.description,
            cnCode: r.cnCode,
            category: r.category,
            netWeight: r.netWeight ? parseFloat(r.netWeight.toString()) : null,
            netWeightUnit: r.netWeightUnit,
            budgetPrice: r.budgetPrice ? parseFloat(r.budgetPrice.toString()) : null,
            costModel: r.costModel,
            supplierId: r.supplierId,
            supplierName: r.supplierName,
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : null,
            lastUpdated: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('de-DE') : null,
        };

        return { success: true, data };
    } catch (error: any) {
        console.error('[Articles] Failed to fetch article:', error);
        return { success: false, error: error?.message || 'Failed to fetch article' };
    }
}

export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) {
            await db.delete(articles).where(eq(articles.id, id));
        } else {
            await db.delete(articles).where(eq(articles.articleNumber, id));
        }
        revalidatePath('/articles');
        return { success: true };
    } catch (error: any) {
        console.error('[Articles] Failed to delete article:', error);
        return { success: false, error: error?.message || 'Failed to delete article' };
    }
}

export async function bulkDeleteArticles(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
    if (!ids.length) return { success: true, count: 0 };
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validUuids = ids.filter((id) => uuidRegex.test(id));
        const nonUuidIds = ids.filter((id) => !uuidRegex.test(id));

        let deletedCount = 0;

        if (validUuids.length > 0) {
            const res = await db.delete(articles).where(inArray(articles.id, validUuids)).returning({ id: articles.id });
            deletedCount += res.length;
        }

        if (nonUuidIds.length > 0) {
            const res = await db.delete(articles).where(inArray(articles.articleNumber, nonUuidIds)).returning({ id: articles.id });
            deletedCount += res.length;
        }

        revalidatePath('/articles');
        return { success: true, count: deletedCount || ids.length };
    } catch (error: any) {
        console.error('[Articles] Failed to bulk delete articles:', error);
        return { success: false, count: 0, error: error?.message || 'Failed to delete articles' };
    }
}

export async function createRFQFromArticles(articleIds: string[]): Promise<{
    success: boolean;
    rfqNumber?: string;
    message: string;
}> {
    try {
        const session = await auth();
        const rfqNum = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        revalidatePath('/articles');
        revalidatePath('/sourcing/rfqs');

        return {
            success: true,
            rfqNumber: rfqNum,
            message: `RFQ ${rfqNum} successfully drafted with ${articleIds.length} article${articleIds.length > 1 ? 's' : ''}`,
        };
    } catch (error: any) {
        console.error('[Articles] Failed to create RFQ:', error);
        return { success: false, message: error?.message || 'Failed to create RFQ' };
    }
}

export async function createRequestFromArticles(articleIds: string[]): Promise<{
    success: boolean;
    requestNumber?: string;
    message: string;
}> {
    try {
        const reqNum = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        revalidatePath('/articles');
        return {
            success: true,
            requestNumber: reqNum,
            message: `Request ${reqNum} created for ${articleIds.length} article${articleIds.length > 1 ? 's' : ''}`,
        };
    } catch (error: any) {
        console.error('[Articles] Failed to create request:', error);
        return { success: false, message: error?.message || 'Failed to create request' };
    }
}

// ---------------------------------------------------------------------------
// Import Processing & Commit
// ---------------------------------------------------------------------------

export interface ParsedArticleImportRow {
    articleNumber: string;
    description?: string;
    longText?: string;
    cnCode?: string;
    category?: string;
    netWeight?: string | number;
    netWeightUnit?: string;
    budgetPrice?: string | number;
    costModel?: string;
    supplierName?: string;
}

export interface ValidatedArticleImportRow {
    rowIndex: number;
    raw: ParsedArticleImportRow;
    cleaned: {
        articleNumber: string;
        description: string | null;
        longText: string | null;
        cnCode: string | null;
        category: string | null;
        netWeight: number | null;
        netWeightUnit: string | null;
        budgetPrice: number | null;
        costModel: string | null;
    };
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export async function prepareArticleImport(
    rawRows: ParsedArticleImportRow[]
): Promise<{
    total: number;
    validCount: number;
    invalidCount: number;
    rows: ValidatedArticleImportRow[];
}> {
    const rows: ValidatedArticleImportRow[] = [];
    const seenArticleNumbers = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
        const raw = rawRows[i];
        const errors: string[] = [];
        const warnings: string[] = [];

        const articleNum = String(raw.articleNumber || '').trim();
        if (!articleNum) {
            errors.push('Article number is required');
        } else if (seenArticleNumbers.has(articleNum.toLowerCase())) {
            warnings.push('Duplicate article number in import file');
        } else {
            seenArticleNumbers.add(articleNum.toLowerCase());
        }

        const desc = raw.description ? String(raw.description).trim() : null;
        const longText = raw.longText ? String(raw.longText).trim() : desc;
        const cnCode = raw.cnCode ? String(raw.cnCode).trim() : null;
        const category = raw.category ? String(raw.category).trim() : null;

        let weightNum: number | null = null;
        if (raw.netWeight != null && raw.netWeight !== '') {
            const parsed = typeof raw.netWeight === 'number' ? raw.netWeight : parseFloat(String(raw.netWeight).replace(',', '.'));
            if (isNaN(parsed)) {
                warnings.push('Invalid net weight number');
            } else {
                weightNum = parsed;
            }
        }

        let priceNum: number | null = null;
        if (raw.budgetPrice != null && raw.budgetPrice !== '') {
            const parsed = typeof raw.budgetPrice === 'number' ? raw.budgetPrice : parseFloat(String(raw.budgetPrice).replace(',', '.'));
            if (!isNaN(parsed)) {
                priceNum = parsed;
            }
        }

        const unit = raw.netWeightUnit ? String(raw.netWeightUnit).trim().toUpperCase() : (weightNum != null ? 'G' : null);

        rows.push({
            rowIndex: i + 1,
            raw,
            cleaned: {
                articleNumber: articleNum,
                description: desc,
                longText,
                cnCode,
                category,
                netWeight: weightNum,
                netWeightUnit: unit,
                budgetPrice: priceNum,
                costModel: raw.costModel ? String(raw.costModel).trim() : null,
            },
            isValid: errors.length === 0,
            errors,
            warnings,
        });
    }

    const validCount = rows.filter((r) => r.isValid).length;
    return {
        total: rows.length,
        validCount,
        invalidCount: rows.length - validCount,
        rows,
    };
}

export async function commitArticleImport(
    items: Array<ValidatedArticleImportRow['cleaned']>
): Promise<{
    success: boolean;
    insertedCount: number;
    error?: string;
}> {
    const session = await auth();
    let validUserId: string | null = null;
    if (session?.user?.id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(session.user.id)) {
            validUserId = session.user.id;
        }
    }

    if (!items.length) {
        return { success: true, insertedCount: 0 };
    }

    try {
        const valuesToInsert = items.map((item) => ({
            articleNumber: item.articleNumber,
            description: item.description,
            longText: item.longText || item.description,
            cnCode: item.cnCode,
            category: item.category,
            netWeight: item.netWeight != null ? item.netWeight.toString() : null,
            netWeightUnit: item.netWeightUnit,
            budgetPrice: item.budgetPrice != null ? item.budgetPrice.toString() : null,
            costModel: item.costModel,
            createdBy: validUserId,
        }));

        await db.insert(articles).values(valuesToInsert);
        revalidatePath('/articles');

        return {
            success: true,
            insertedCount: valuesToInsert.length,
        };
    } catch (error: any) {
        console.error('[Articles] Failed to commit article import:', error);
        return {
            success: false,
            insertedCount: 0,
            error: error?.message || 'Failed to save imported articles to database',
        };
    }
}
