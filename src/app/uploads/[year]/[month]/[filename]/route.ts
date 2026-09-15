import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    csv: "text/csv; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
};

function isSafePathSegment(value: string) {
    return /^[a-zA-Z0-9._-]+$/.test(value) && value !== "." && value !== "..";
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ year: string; month: string; filename: string }> },
) {
    const { year, month, filename } = await params;
    if (!isSafePathSegment(year) || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !isSafePathSegment(filename)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", year, month, filename);
    try {
        const file = await readFile(filePath);
        const extension = path.extname(filename).slice(1).toLowerCase();
        return new NextResponse(file, {
            headers: {
                "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
                "Content-Disposition": `inline; filename="${filename}"`,
                "Cache-Control": "private, no-cache",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}