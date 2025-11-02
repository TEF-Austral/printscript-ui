export enum OwnershipFilter {
  OWNED = "OWNED",
  SHARED = "SHARED",
  ALL = "ALL",
}

export enum ComplianceFilter {
  PENDING = "PENDING",
  FAILED = "FAILED",
  NON_COMPLIANT = "NON_COMPLIANT",
  COMPLIANT = "COMPLIANT",
  ALL = "ALL",
}

export enum SortField {
  NAME = "NAME",
  LANGUAGE = "LANGUAGE",
  COMPLIANCE = "COMPLIANCE",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface SnippetFilters {
  ownership: OwnershipFilter;
  name?: string;
  language?: string;
  compliance: ComplianceFilter;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const defaultFilters: SnippetFilters = {
  ownership: OwnershipFilter.ALL,
  name: undefined,
  language: undefined,
  compliance: ComplianceFilter.ALL,
  sortBy: SortField.NAME,
  sortOrder: SortOrder.ASC,
};
