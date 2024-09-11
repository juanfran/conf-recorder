import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import { projectDirname } from './project-dirname.js';

export function createPdf(id: string, text: string, summary: string) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();

    const filePath = `${projectDirname()}/recordings/${id}/${id}.pdf`;

    const stream = doc.pipe(fs.createWriteStream(filePath));

    doc
      .fontSize(25)
      .font('Helvetica-Bold')
      .text('Full transcription of the conversation:');
    doc.fontSize(12).font('Helvetica').text(text.trim());

    doc.moveDown();

    doc.fontSize(25).font('Helvetica-Bold').text('AI-generated summary:');
    doc.fontSize(12).font('Helvetica').text(summary.trim());

    doc.end();

    stream.on('finish', function () {
      resolve(filePath);
    });
  });
}
