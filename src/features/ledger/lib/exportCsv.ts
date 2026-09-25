/**
 * Revolt Ledger — CSV Export Utility
 */

export function exportPaymentsToCSV(payments: any[], filename = 'ledger_payments_export.csv') {
  if (!payments || payments.length === 0) return;

  const headers = [
    'Invoice Number',
    'Client Name',
    'Sender Name',
    'Received Date',
    'Gross Amount ($)',
    'Client Rate (%)',
    'Total Commission ($)',
    'Wasi Rate (%)',
    'Wasi Amount ($)',
    'Ali Rate (%)',
    'Ali Amount ($)',
    'Wire Amount ($)',
    'Status',
    'Wire Date',
    'Wire Reference',
    'Notes'
  ];

  const rows = payments.map(p => [
    `"${p.invoice_number || ''}"`,
    `"${p.client_name || ''}"`,
    `"${p.sender_name || ''}"`,
    `"${p.received_date || ''}"`,
    p.gross_amount ?? '',
    p.client_rate_snapshot ?? '',
    p.total_commission ?? '',
    p.wasi_rate_snapshot ?? '',
    p.wasi_amount ?? '',
    p.ali_rate_snapshot ?? '',
    p.ali_amount ?? '',
    p.wire_amount ?? '',
    `"${p.status || ''}"`,
    `"${p.wire_date || ''}"`,
    `"${p.wire_reference || ''}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
