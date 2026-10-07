export interface AppliedDocumentFilter {
    key: string;
    operator: string;
    value: string;
}

export function parseDateToMidnight(dateStr: string | null | undefined): Date | null {
    if (!dateStr || !dateStr.trim() || dateStr === '—' || dateStr === 'null' || dateStr === 'undefined') return null;
    const str = dateStr.trim();

    // Match DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
    }

    // Match YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    const ymdMatch = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymdMatch) {
        const year = parseInt(ymdMatch[1], 10);
        const month = parseInt(ymdMatch[2], 10) - 1;
        const day = parseInt(ymdMatch[3], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
    }

    return null;
}

export function matchesFilter(fieldValue: string | null | undefined, operator: string, testValue?: string): boolean {
    const val = (fieldValue || "").toLowerCase().trim();
    const q = (testValue || "").toLowerCase().trim();

    const isDateOp = ['on', 'not on', 'before', 'before or on', 'after', 'after or on'].includes(operator);
    if (isDateOp) {
        const docDate = parseDateToMidnight(fieldValue);
        const filterDate = parseDateToMidnight(testValue);
        if (!filterDate) return true;
        if (!docDate) return false;

        const dTime = docDate.getTime();
        const fTime = filterDate.getTime();

        switch (operator) {
            case 'on':
                return dTime === fTime;
            case 'not on':
                return dTime !== fTime;
            case 'before':
                return dTime < fTime;
            case 'before or on':
                return dTime <= fTime;
            case 'after':
                return dTime > fTime;
            case 'after or on':
                return dTime >= fTime;
        }
    }

    switch (operator) {
        case 'is one of': {
            if (!testValue || !testValue.trim()) return true;
            const selectedOptions = testValue.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
            const isValBlank = !val || val === '—' || val === 'null' || val === 'undefined';
            const hasBlankSelected = selectedOptions.some((opt) => opt === '(blanks)' || opt === 'blanks' || opt === 'blank');
            if (isValBlank) return hasBlankSelected;
            return selectedOptions.includes(val);
        }
        case 'is none of': {
            if (!testValue || !testValue.trim()) return true;
            const selectedOptions = testValue.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
            const isValBlank = !val || val === '—' || val === 'null' || val === 'undefined';
            const hasBlankSelected = selectedOptions.some((opt) => opt === '(blanks)' || opt === 'blanks' || opt === 'blank');
            if (isValBlank) return !hasBlankSelected;
            return !selectedOptions.includes(val);
        }
        case 'contains':
            return val.includes(q);
        case 'does not contain':
            return !val.includes(q);
        case 'equals':
        case 'is':
            if (val === 'true' || val === 'false') {
                if (q === 'true' || q === 'yes' || q === 'archived' || q === '1') return val === 'true';
                if (q === 'false' || q === 'no' || q === 'active' || q === 'unarchived' || q === '0') return val === 'false';
            }
            return val === q;
        case 'does not equal':
        case 'is not':
            if (val === 'true' || val === 'false') {
                if (q === 'true' || q === 'yes' || q === 'archived' || q === '1') return val !== 'true';
                if (q === 'false' || q === 'no' || q === 'active' || q === 'unarchived' || q === '0') return val === 'true';
            }
            return val !== q;
        case 'blank':
            return !val || val === 'false' || val === '—' || val === 'null' || val === 'undefined';
        case 'not blank':
            return !!val && val !== 'false' && val !== '—' && val !== 'null' && val !== 'undefined';
        case 'begins with':
            return val.startsWith(q);
        case 'does not begin with':
            return !val.startsWith(q);
        case 'ends with':
            return val.endsWith(q);
        case 'does not end with':
            return !val.endsWith(q);
        default:
            return val.includes(q);
    }
}


