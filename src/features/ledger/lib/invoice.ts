// ============================================================================
// Revolt Ledger — Invoice Number Generation
// ============================================================================

/**
 * Generate an invoice number using the database sequence.
 * Format: INV-YYYY-NNNN (e.g., INV-2026-0001)
 * 
 * Uses PostgreSQL sequence to guarantee uniqueness even under concurrent inserts.
 */
export function generateInvoiceQuery(): string {
  const year = new Date().getFullYear();
  return `SELECT 'INV-${year}-' || LPAD(nextval('ledger_invoice_seq')::text, 4, '0') AS invoice_number`;
}

/**
 * Parse an invoice number to extract year and sequence.
 */
export function parseInvoiceNumber(invoice: string): { year: number; sequence: number } | null {
  const match = invoice.match(/^INV-(\d{4})-(\d{4,})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  };
}
