import { addDays, set, nextFriday, parse } from "date-fns";
import { toDate } from "date-fns-tz";

export const parseAIDeadline = (suggestion: string): Date | null => {
  if (!suggestion) return null;

  const lowerSuggestion = suggestion.toLowerCase();
  const timeZone = "Asia/Kolkata"; // IST

  // Get the current date in IST timezone
  const now = toDate(new Date(), { timeZone });

  // Set time to end of day for consistency
  const endOfDay = { hours: 23, minutes: 59, seconds: 59 };
  let resultDate = set(now, endOfDay);

  // Case 1: "today"
  if (lowerSuggestion.includes("today")) {
    return resultDate;
  }

  // Case 2: "tomorrow"
  if (lowerSuggestion.includes("tomorrow")) {
    resultDate = addDays(resultDate, 1);
    return resultDate;
  }

  // Case 3: "in X days"
  const daysMatch = lowerSuggestion.match(/in (\d+) days?/);
  if (daysMatch && daysMatch[1]) {
    const numberOfDays = parseInt(daysMatch[1], 10);
    resultDate = addDays(resultDate, numberOfDays);
    return resultDate;
  }

  // Case 4: "next Friday", "by Friday" etc.
  if (lowerSuggestion.includes("friday")) {
    resultDate = nextFriday(resultDate);
    return set(resultDate, endOfDay);
  }

  // Fallback for other formats - this is less reliable and can be expanded
  try {
    const parsed = parse(suggestion, "MMMM do", new Date());
    if (parsed.toString() !== "Invalid Date") {
      return set(toDate(parsed, { timeZone }), endOfDay);
    }
  } catch (e) {
    console.error(e);
    // Ignore parsing errors and return null
  }

  return null; // Return null if no pattern matches
};

/**
 * Formats a JavaScript Date object into a YYYY-MM-DD string.
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Tries to parse a date string from various common formats and normalizes it to YYYY-MM-DD.
 * It now prioritizes DD-MM-YYYY to avoid ambiguity with the native Date constructor.
 * Returns null if the format is unrecognizable.
 */
export const normalizeDateForImport = (
  dateString: string | null | undefined
): string | null => {
  if (!dateString?.trim()) {
    return null;
  }

  // Prioritize specific, potentially ambiguous formats first with date-fns.
  // This will correctly handle DD-MM-YYYY before the native constructor can misinterpret it.
  const formatsToTry = ["dd-MM-yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy"];

  for (const format of formatsToTry) {
    try {
      const parsedDate = parse(dateString, format, new Date());
      if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
        const year = parsedDate.getFullYear();
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
        const day = parsedDate.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error(e);
      // Ignore and try the next format
    }
  }

  // As a last resort, try the flexible native Date constructor for other formats like "July 8, 2025".
  const nativeDate = new Date(dateString);
  if (!isNaN(nativeDate.getTime()) && nativeDate.getFullYear() > 1900) {
    const year = nativeDate.getFullYear();
    const month = (nativeDate.getMonth() + 1).toString().padStart(2, "0");
    const day = nativeDate.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // If all parsing attempts fail, return null.
  return null;
};
