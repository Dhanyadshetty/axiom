/**
 * Utility for resolving document creator profiles and verified corporate email addresses.
 */

export interface DocumentCreatorInput {
    createdByName?: string | null;
    createdByEmail?: string | null;
    createdById?: string | null;
    joinedUserName?: string | null;
    joinedUserEmail?: string | null;
    sessionUser?: { name?: string | null; email?: string | null; id?: string | null } | null;
}

export function resolveDocumentCreator(doc: DocumentCreatorInput): { name: string; email: string } {
    // 1. Determine Creator Display Name (prefer explicitly recorded createdByName on the document)
    const name = (
        doc.createdByName?.trim() ||
        doc.joinedUserName?.trim() ||
        doc.sessionUser?.name?.trim() ||
        "Axiom User"
    );

    const lowerName = name.toLowerCase();

    // 2. Direct exact/substring check for Prettl organization members to ensure reminders reach the exact person
    let email = "";
    if (lowerName.includes("dhanya")) {
        email = "dhanya.shetty@prettl.com";
    } else if (lowerName.includes("vinay")) {
        email = "vinay.temkar@prettl.com";
    } else if (lowerName.includes("sandeep")) {
        email = "sandeep.p@prettl.com";
    } else if (doc.createdByEmail && doc.createdByEmail.includes("@")) {
        email = doc.createdByEmail.trim();
    } else if (doc.joinedUserEmail && doc.joinedUserEmail.includes("@")) {
        const joinedLower = (doc.joinedUserName || "").toLowerCase();
        // Only use foreign-key joinedUserEmail if the joined user name matches the creator's display name
        if (joinedLower && (lowerName.includes(joinedLower) || joinedLower.includes(lowerName))) {
            email = doc.joinedUserEmail.trim();
        }
    }

    // 3. Dynamic corporate email derivation from creator name (e.g. "Jane Doe" -> "jane.doe@prettl.com")
    if (!email || !email.includes("@")) {
        const clean = lowerName.replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, ".");
        if (clean && clean.length > 2) {
            email = `${clean}@prettl.com`;
        } else {
            email = process.env.SMTP_USER || "pma.axiom.support@gmail.com";
        }
    }

    return { name, email };
}
