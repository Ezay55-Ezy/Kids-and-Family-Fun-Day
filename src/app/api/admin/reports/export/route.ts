import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { reportExportSchema } from '@/validators/report.validator';
import { getReportDataForExport, generateCsv } from '@/services/report-service';
import ExcelJS from 'exceljs';

const reportLabels: Record<string, string> = {
  events: 'Events',
  bookings: 'Bookings',
  users: 'Users',
  vendors: 'Vendors',
  reviews: 'Reviews',
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const body = await request.json();
  const parsed = reportExportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const filters = {
    type: data.type,
    query: data.query,
    status: data.status,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    eventId: data.eventId,
    vendorId: data.vendorId,
    role: data.role,
    page: 1,
    limit: 100000,
  };

  const exportData = await getReportDataForExport(filters);
  const label = reportLabels[data.type] || data.type;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${label.toLowerCase()}-report-${dateStr}`;

  if (data.format === 'csv') {
    const csv = generateCsv(exportData.headers, exportData.rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  }

  // Excel export
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Kids & Family Fun Day Kenya';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(label);

  // Header row with styling
  const headerRow = sheet.addRow(exportData.headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A2E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Data rows
  exportData.rows.forEach((row) => {
    sheet.addRow(row);
  });

  // Auto-size columns
  sheet.columns.forEach((column) => {
    let maxLen = 10;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value || '').length;
      if (len > maxLen) maxLen = len;
    });
    column.width = Math.min(maxLen + 2, 50);
  });

  // Add summary row
  sheet.addRow([]);
  const summaryRow = sheet.addRow([`Total: ${exportData.total} records`, `Generated: ${new Date().toLocaleString('en-KE')}`]);
  summaryRow.font = { italic: true, color: { argb: 'FF666666' } };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
    },
  });
}
