import { Lead } from '@prisma/client';
import * as ExcelJS from 'exceljs';

function fmt(d: Date | null | undefined): string {
  if (!d) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

export async function buildLeadsXlsx(leads: Lead[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LumaLab CRM';
  wb.created = new Date();

  const ws = wb.addWorksheet('Leads');

  ws.columns = [
    { header: 'ID', key: 'id', width: 14 },
    { header: 'Created', key: 'createdAt', width: 18 },
    { header: 'Kind', key: 'kind', width: 10 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Contact name', key: 'contactName', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'Locale', key: 'locale', width: 8 },
    { header: 'Company', key: 'companyName', width: 24 },
    { header: 'Site', key: 'companySite', width: 28 },
    { header: 'Industry', key: 'industry', width: 18 },
    { header: 'Stage', key: 'stage', width: 12 },
    { header: 'Revenue', key: 'revenueRange', width: 14 },
    { header: 'Equity', key: 'equityReady', width: 12 },
    { header: 'Desired role', key: 'desiredRole', width: 16 },
    { header: 'Work format', key: 'workFormat', width: 14 },
    { header: 'Country', key: 'country', width: 18 },
    { header: 'Comment', key: 'comment', width: 40 },
    { header: 'Data (JSON)', key: 'data', width: 60 },
  ];

  for (const lead of leads) {
    ws.addRow({
      id: lead.id,
      createdAt: fmt(lead.createdAt),
      kind: lead.kind,
      status: lead.status,
      contactName: lead.contactName,
      email: lead.email,
      whatsapp: lead.whatsapp ?? '',
      locale: lead.locale ?? '',
      companyName: lead.companyName ?? '',
      companySite: lead.companySite ?? '',
      industry: lead.industry ?? '',
      stage: lead.stage ?? '',
      revenueRange: lead.revenueRange ?? '',
      equityReady: lead.equityReady ?? '',
      desiredRole: lead.desiredRole ?? '',
      workFormat: lead.workFormat ?? '',
      country: lead.country ?? '',
      comment: lead.comment ?? '',
      data: JSON.stringify(lead.data ?? {}),
    });
  }

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF075EA8' }, // LumaLab primary blue
  };
  ws.getRow(1).alignment = { vertical: 'middle' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
