import { jsPDF } from 'jspdf';
import { ChatSession } from '../types';

export function exportChatAsText(session: ChatSession) {
  let content = `========================================\n`;
  content += `SOYO Mind - A Virtual Artificial Intelligence (VAI)\n`;
  content += `Conversation: ${session.title}\n`;
  content += `Export Date: ${new Date().toLocaleString()}\n`;
  content += `========================================\n\n`;

  session.messages.forEach((msg, idx) => {
    const role = msg.role === 'user' ? 'YOU' : 'SOYO MIND VAI';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    content += `[${time}] ${role}:\n${msg.content}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SOYO_Mind_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportChatAsPdf(session: ChatSession) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin + 20;

  // Header Banner
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(margin, margin - 10, pageWidth - margin * 2, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SOYO Mind VAI - Conversation Export', margin + 14, margin + 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Title: ${session.title}  |  ${new Date().toLocaleDateString()}`, margin + 14, margin + 30);

  y = margin + 65;

  session.messages.forEach((msg) => {
    const isUser = msg.role === 'user';
    const roleName = isUser ? 'User' : 'SOYO Mind VAI';

    // Check page overflow
    if (y > 740) {
      doc.addPage();
      y = margin + 20;
    }

    // Role Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    if (isUser) {
      doc.setTextColor(79, 70, 229); // Indigo
    } else {
      doc.setTextColor(147, 51, 234); // Purple
    }
    doc.text(`${roleName} [${new Date(msg.timestamp).toLocaleTimeString()}]:`, margin, y);
    y += 16;

    // Message Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    // Split text to fit page width
    const lines = doc.splitTextToSize(msg.content, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (y > 780) {
        doc.addPage();
        y = margin + 20;
      }
      doc.text(line, margin, y);
      y += 14;
    });

    y += 12; // spacing between messages
  });

  doc.save(`SOYO_Mind_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export async function exportChatAsImage(session: ChatSession): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 800;
  canvas.width = width;
  
  // Measure content
  const margin = 40;
  const contentWidth = width - margin * 2;
  
  ctx.font = '14px sans-serif';
  let totalHeight = 160;

  // Compute required height
  session.messages.slice(0, 10).forEach((msg) => {
    const lines = wrapCanvasText(ctx, msg.content, contentWidth - 40);
    totalHeight += 40 + lines.length * 20 + 20;
  });

  canvas.height = Math.max(600, totalHeight + 80);

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, canvas.height);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#eef2ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, canvas.height);

  // Header Card
  ctx.fillStyle = '#4f46e5';
  roundRect(ctx, margin, 30, contentWidth, 70, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('SOYO Mind VAI - Artificial Intelligence', margin + 24, 62);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#e0e7ff';
  ctx.fillText(`Topic: ${session.title}  •  ${new Date().toLocaleDateString()}`, margin + 24, 84);

  let currentY = 130;

  // Draw messages
  session.messages.slice(0, 10).forEach((msg) => {
    const isUser = msg.role === 'user';
    const lines = wrapCanvasText(ctx, msg.content, contentWidth - 50);
    const boxHeight = lines.length * 20 + 36;

    // Card background
    ctx.fillStyle = isUser ? '#ffffff' : '#f5f3ff';
    ctx.strokeStyle = isUser ? '#e2e8f0' : '#ddd6fe';
    ctx.lineWidth = 1.5;
    roundRect(ctx, margin, currentY, contentWidth, boxHeight, 14);
    ctx.fill();
    ctx.stroke();

    // Author
    ctx.fillStyle = isUser ? '#4f46e5' : '#7c3aed';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(
      isUser ? 'You' : 'SOYO Mind VAI',
      margin + 18,
      currentY + 20
    );

    // Text
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px sans-serif';
    lines.forEach((line, idx) => {
      ctx.fillText(line, margin + 18, currentY + 40 + idx * 20);
    });

    currentY += boxHeight + 16;
  });

  // Footer branding
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Generated by SOYO Mind - A Virtual Artificial Intelligence', margin, canvas.height - 24);

  // Trigger download
  const imageUri = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = imageUri;
  a.download = `SOYO_Mind_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\n/g, ' ').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
