export type AlphabeticalOrder = "none" | "asc" | "desc";

interface TableFilterOptions<T> {
  dateFrom?: string;
  dateTo?: string;
  alphabeticalOrder?: AlphabeticalOrder;
  getCreatedAt?: (item: T) => string | undefined | null;
  getAlphabeticalValue?: (item: T) => string | undefined | null;
}

const toDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const applyTableFilters = <T>(
  data: T[],
  options: TableFilterOptions<T>
): T[] => {
  const {
    dateFrom,
    dateTo,
    alphabeticalOrder = "none",
    getCreatedAt,
    getAlphabeticalValue,
  } = options;

  const fromDate = toDate(dateFrom);
  const toDateValue = toDate(dateTo);
  if (toDateValue) {
    toDateValue.setHours(23, 59, 59, 999);
  }

  let rows = data;

  if (fromDate || toDateValue) {
    rows = rows.filter((item) => {
      const createdAt = getCreatedAt?.(item);
      const createdAtDate = toDate(createdAt);
      if (!createdAtDate) return false;
      if (fromDate && createdAtDate < fromDate) return false;
      if (toDateValue && createdAtDate > toDateValue) return false;
      return true;
    });
  }

  if (alphabeticalOrder !== "none") {
    rows = [...rows].sort((a, b) => {
      const aValue = (getAlphabeticalValue?.(a) || "").toString();
      const bValue = (getAlphabeticalValue?.(b) || "").toString();
      const compared = aValue.localeCompare(bValue, "es", {
        sensitivity: "base",
        numeric: true,
      });
      return alphabeticalOrder === "asc" ? compared : -compared;
    });
  }

  return rows;
};
