import * as df2026001 from './DF-2026-001'

export const tenderDocuments = {
  'DF-2026-001': df2026001,
}

export function getTenderDocument(slug) {
  return tenderDocuments[slug] ?? null
}
