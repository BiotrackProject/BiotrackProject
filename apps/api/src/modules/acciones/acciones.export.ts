import path from 'node:path';
import { existsSync } from 'node:fs';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { env } from '../../config/env.js';

/**
 * Estructura mínima que necesitan los generadores. Coincide con el objeto
 * devuelto por `getAccion` (acciones.service.ts).
 */
export interface AccionExportData {
  IDAccion: string;
  titulo: string;
  descripcion_accion: string | null;
  Estado: string;
  FechaPlanificacion: Date | null;
  FechaImplementacion: Date | null;
  resumen_publico: string | null;
  Resultado: string | null;
  Presupuesto: unknown;
  Usuario?: { nombre_completo?: string | null; institucion?: string | null } | null;
  accion_denuncia?: Array<{ Denuncia: { codigo_seguimiento: string; Estado: string } }>;
  accion_zona?: Array<{ IDZona: string }>;
  Evidencia_Accion?: Array<{ archivo_url: string; TipoArchivo: string }>;
}

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

const BRAND = '#1f6f54';

function fmtFecha(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 10);
}

/** Resuelve la ruta física local de una evidencia a partir de su URL pública. */
function rutaLocalEvidencia(archivoUrl: string): string | null {
  const filename = path.basename(archivoUrl);
  const ruta = path.resolve(env.STORAGE_LOCAL_PATH, 'acciones', filename);
  return existsSync(ruta) ? ruta : null;
}

/** Escribe el encabezado institucional y todos los campos de la acción. */
function renderCampos(doc: PDFKit.PDFDocument, accion: AccionExportData): void {
  doc.rect(0, 0, doc.page.width, 70).fill(BRAND);
  doc.fillColor('white').fontSize(22).text('BIOTRACK', 50, 22, { continued: false });
  doc.fontSize(10).text('Reporte de Acción Correctiva', 50, 48);
  doc.fillColor('black').moveDown(3);

  const label = (l: string, v: string) => {
    doc.fontSize(10).fillColor('#666').text(l);
    doc.fontSize(12).fillColor('black').text(v || '—');
    doc.moveDown(0.6);
  };

  doc.fontSize(16).fillColor('black').text(accion.titulo);
  doc.moveDown(0.8);

  label('ID', accion.IDAccion);
  label('Estado', accion.Estado);
  label('Responsable', accion.Usuario?.nombre_completo ?? '—');
  label('Institución', accion.Usuario?.institucion ?? '—');
  label('Fecha de planificación', fmtFecha(accion.FechaPlanificacion));
  label('Fecha de implementación', fmtFecha(accion.FechaImplementacion));
  label(
    'Presupuesto',
    accion.Presupuesto != null ? `RD$ ${String(accion.Presupuesto)}` : '—'
  );
  label('Descripción', accion.descripcion_accion ?? '—');
  if (accion.Resultado) label('Resultado', accion.Resultado);
  if (accion.resumen_publico) label('Resumen público', accion.resumen_publico);

  const denuncias = accion.accion_denuncia ?? [];
  label(
    'Denuncias vinculadas',
    denuncias.length
      ? denuncias.map((d) => `${d.Denuncia.codigo_seguimiento} (${d.Denuncia.Estado})`).join(', ')
      : 'Ninguna'
  );

  const zonas = accion.accion_zona ?? [];
  label('Zonas vinculadas', zonas.length ? zonas.map((z) => z.IDZona).join(', ') : 'Ninguna');
}

/** Añade una página con las evidencias de tipo imagen (si existen en disco). */
function renderEvidencias(doc: PDFKit.PDFDocument, accion: AccionExportData): void {
  const imagenes = (accion.Evidencia_Accion ?? []).filter((e) => e.TipoArchivo === 'Imagen');
  if (imagenes.length === 0) return;

  doc.addPage();
  doc.fontSize(14).fillColor(BRAND).text('Evidencias', { underline: false });
  doc.moveDown(0.5);
  for (const img of imagenes) {
    const ruta = rutaLocalEvidencia(img.archivo_url);
    if (!ruta) continue;
    try {
      doc.image(ruta, { fit: [480, 360], align: 'center' });
      doc.moveDown(1);
    } catch {
      // Si una imagen está corrupta, se omite sin romper el PDF.
    }
  }
}

/** Escribe "Página i de n" al pie de cada página del documento. */
function renderNumeracionPaginas(doc: PDFKit.PDFDocument): void {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#999')
      .text(`Página ${i + 1} de ${range.count}`, 50, doc.page.height - 40, {
        align: 'center',
        width: doc.page.width - 100,
      });
  }
}

/**
 * RF-5.3 — Genera el reporte PDF con diseño institucional BIOTRACK.
 * Incluye encabezado, todos los campos, evidencias (si se solicita) y nº de página.
 */
export function generarPDF(
  accion: AccionExportData,
  incluirEvidencias: boolean
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => {
      resolve({
        buffer: Buffer.concat(chunks),
        contentType: 'application/pdf',
        filename: `accion-${accion.IDAccion}.pdf`,
      });
    });

    renderCampos(doc, accion);
    if (incluirEvidencias) renderEvidencias(doc, accion);
    renderNumeracionPaginas(doc);

    doc.end();
  });
}

/**
 * RF-5.3 — Genera el reporte en XLSX con los campos de la acción.
 */
export async function generarXLSX(accion: AccionExportData): Promise<ExportResult> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BIOTRACK';
  const ws = wb.addWorksheet('Acción Correctiva');

  ws.columns = [
    { header: 'Campo', key: 'campo', width: 30 },
    { header: 'Valor', key: 'valor', width: 80 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F6F54' },
  };

  const denuncias = (accion.accion_denuncia ?? [])
    .map((d) => `${d.Denuncia.codigo_seguimiento} (${d.Denuncia.Estado})`)
    .join(', ');
  const zonas = (accion.accion_zona ?? []).map((z) => z.IDZona).join(', ');

  const filas: Array<[string, string]> = [
    ['ID', accion.IDAccion],
    ['Título', accion.titulo],
    ['Estado', accion.Estado],
    ['Responsable', accion.Usuario?.nombre_completo ?? '—'],
    ['Institución', accion.Usuario?.institucion ?? '—'],
    ['Fecha de planificación', fmtFecha(accion.FechaPlanificacion)],
    ['Fecha de implementación', fmtFecha(accion.FechaImplementacion)],
    ['Presupuesto', accion.Presupuesto != null ? String(accion.Presupuesto) : '—'],
    ['Descripción', accion.descripcion_accion ?? '—'],
    ['Resultado', accion.Resultado ?? '—'],
    ['Resumen público', accion.resumen_publico ?? '—'],
    ['Denuncias vinculadas', denuncias || 'Ninguna'],
    ['Zonas vinculadas', zonas || 'Ninguna'],
  ];

  filas.forEach(([campo, valor]) => ws.addRow({ campo, valor }));

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: `accion-${accion.IDAccion}.xlsx`,
  };
}
