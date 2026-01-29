
/**
 * Safely parses a date string or object into a Date object.
 * Returns null if the date is invalid.
 * Handles Safari-specific issues with 'YYYY-MM-DD HH:mm:ss' which needs 'T' or '/' replacement.
 */
export const safeParseDate = (dateInput: string | Date | null | undefined): Date | null => {
    if (!dateInput) return null;

    let dateObj: Date;

    if (dateInput instanceof Date) {
        dateObj = dateInput;
    } else {
        // Detect regex for space-separated SQL timestamp like "2024-01-29 12:00:00"
        // Safari requires ISO "2024-01-29T12:00:00" or slashes "2024/01/29 12:00:00"
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(dateInput)) {
            dateObj = new Date(dateInput.replace(' ', 'T'));
        } else {
            dateObj = new Date(dateInput);
        }
    }

    if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date detected:', dateInput);
        return null;
    }

    return dateObj;
};

/**
 * Formats a date safely. Returns a fallback string if invalid.
 */
export const formatDate = (
    dateInput: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions,
    fallback: string = 'N/A'
): string => {
    const date = safeParseDate(dateInput);
    if (!date) return fallback;

    try {
        return date.toLocaleDateString('en-IN', options);
    } catch (e) {
        return fallback;
    }
};

/**
 * Formats date and time safely.
 */
export const formatDateTime = (
    dateInput: string | Date | null | undefined,
    fallback: string = 'N/A'
): string => {
    const date = safeParseDate(dateInput);
    if (!date) return fallback;

    try {
        return date.toLocaleString('en-IN');
    } catch (e) {
        return fallback;
    }
};

/**
 * Get current year safely (for Footer etc)
 */
export const getCurrentYear = (): number => {
    return new Date().getFullYear();
}
