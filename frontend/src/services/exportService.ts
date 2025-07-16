import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CanvasState } from '../types/api';

export interface ExportOptions {
  format: 'pdf' | 'json';
  fileName?: string;
}

export class ExportService {
  /**
   * Exporta o canvas para PDF ou JSON
   */
  static async exportCanvas(
    canvasState: CanvasState, 
    canvasName: string, 
    options: ExportOptions
  ): Promise<void> {
    const fileName = options.fileName || `DIP-AI_${canvasName}`;
    
    if (options.format === 'pdf') {
      await this.exportToPDF(canvasState, canvasName, fileName);
    } else if (options.format === 'json') {
      this.exportToJSON(canvasState, canvasName, fileName);
    }
  }

  /**
   * Exporta o canvas para PDF
   */
  private static async exportToPDF(
    canvasState: CanvasState, 
    canvasName: string, 
    fileName: string
  ): Promise<void> {
    try {
      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20; // Margem de 20mm
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin; // Posição Y atual
      const fields = canvasState.fields || [];
      
      // Adicionar cabeçalho
      currentY = this.addHeader(pdf, canvasName, margin, contentWidth, currentY);
      
      // Se não há campos, mostrar mensagem
      if (fields.length === 0) {
        currentY = this.addEmptyMessage(pdf, margin, contentWidth, currentY);
      } else {
        // Renderizar cada campo
        for (const field of fields) {
          // Verificar se o campo cabe na página atual
          const fieldHeight = this.estimateFieldHeight(field);
          
          // Se não cabe, criar nova página
          if (currentY + fieldHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          currentY = await this.addFieldToPDF(pdf, field, margin, contentWidth, currentY);
        }
      }
      
      // Adicionar rodapé
      this.addFooter(pdf, margin, contentWidth, pageHeight);
      
      // Download do PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw new Error('Erro ao gerar PDF. Tente novamente.');
    }
  }

  /**
   * Exporta o canvas para JSON
   */
  private static exportToJSON(
    canvasState: CanvasState, 
    canvasName: string, 
    fileName: string
  ): void {
    try {
      // Filtrar apenas os campos necessários dos fields
      const filteredFields = (canvasState.fields || []).map(field => ({
        id: field.id,
        title: field.title,
        question: field.question,
        answer: field.answer
      }));

      const exportData = {
        name: canvasName,
        exportDate: new Date().toISOString(),
        fields: filteredFields
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${fileName}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      throw new Error('Erro ao gerar JSON. Tente novamente.');
    }
  }

  /**
   * Adiciona cabeçalho ao PDF
   */
  private static addHeader(pdf: jsPDF, canvasName: string, margin: number, contentWidth: number, currentY: number): number {
    // Título principal "DIP-AI" centralizado
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128); // #6b7280
    
    const dipAiTitle = 'DIP-AI';
    const dipAiWidth = pdf.getTextWidth(dipAiTitle);
    pdf.text(dipAiTitle, margin + (contentWidth - dipAiWidth) / 2, currentY + 8);
    currentY += 20;
    
    // Nome do projeto (centralizado)
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55); // #1f2937
    
    const projectLines = pdf.splitTextToSize(canvasName, contentWidth);
    const projectHeight = projectLines.length * 7;
    
    // Centralizar cada linha do nome do projeto
    projectLines.forEach((line: string, index: number) => {
      const lineWidth = pdf.getTextWidth(line);
      pdf.text(line, margin + (contentWidth - lineWidth) / 2, currentY + (index * 7));
    });
    
    currentY += projectHeight;
    
    // Linha separadora
    pdf.setDrawColor(59, 130, 246); // #3b82f6
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 5;
    
    return currentY;
  }

  /**
   * Adiciona mensagem de canvas vazio
   */
  private static addEmptyMessage(pdf: jsPDF, margin: number, contentWidth: number, currentY: number): number {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128); // #6b7280
    
    const title = 'Canvas Vazio';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, margin + (contentWidth - titleWidth) / 2, currentY + 40);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const message = 'Este canvas ainda não possui campos preenchidos.';
    const messageWidth = pdf.getTextWidth(message);
    pdf.text(message, margin + (contentWidth - messageWidth) / 2, currentY + 60);
    
    return currentY + 80;
  }

  /**
   * Estima a altura necessária para um campo
   */
  private static estimateFieldHeight(field: any): number {
    const baseHeight = 25; // Altura base do campo
    const answerText = field.answer ? field.answer.trim() : '';
    const answerLength = answerText.length;
    const estimatedAnswerLines = Math.max(1, Math.ceil(answerLength / 80)); // ~80 chars por linha
    const answerHeight = estimatedAnswerLines * 5; // 5mm por linha
    
    return baseHeight + answerHeight;
  }

  /**
   * Adiciona um campo ao PDF
   */
  private static async addFieldToPDF(pdf: jsPDF, field: any, margin: number, contentWidth: number, currentY: number): Promise<number> {
    const colors = this.getFieldColors(field.id, !!(field.answer && field.answer.trim()));
    const startY = currentY;
    
    // Converter cores hex para RGB
    const bgColor = this.hexToRgb(colors.background);
    const borderColor = this.hexToRgb(colors.border);
    
    // Desenhar fundo do card
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    pdf.setLineWidth(0.5);
    
    // Calcular altura necessária
    const answerText = field.answer ? field.answer.trim() : 'Não respondida';
    const answerLines = pdf.splitTextToSize(answerText, contentWidth - 20);
    const answerHeight = Math.max(15, answerLines.length * 5 + 10);
    const totalHeight = 6 + answerHeight;
    
    // Desenhar retângulo do card
    pdf.roundedRect(margin, currentY, contentWidth, totalHeight, 3, 3, 'FD');
    currentY += 8;
    
    // Título do campo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55); // #1f2937
    
    const title = `${field.id} - ${field.title || ''}`;
    const titleLines = pdf.splitTextToSize(title, contentWidth - 30);
    pdf.text(titleLines, margin + 8, currentY);
    
    // Indicador de preenchido (círculo)
    if (field.answer && field.answer.trim()) {
      const indicatorColor = this.hexToRgb(colors.indicator);
      pdf.setFillColor(indicatorColor.r, indicatorColor.g, indicatorColor.b);
      pdf.circle(margin + contentWidth - 15, currentY - 2, 2, 'F');
    }
    
    currentY += titleLines.length * 5;
    
    // Fundo da resposta
    // pdf.setFillColor(255, 255, 255); // branco
    // pdf.setDrawColor(229, 231, 235); // #e5e7eb
    // pdf.roundedRect(margin + 1, currentY, contentWidth - 16, answerHeight, 2, 2, 'FD');
    
    // Texto da resposta
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55); // #1f2937
    
    if (field.answer && field.answer.trim()) {
      // Justificar o texto da resposta
      const textOptions = {
        align: 'justify' as const,
        maxWidth: contentWidth - 24
      };
      pdf.text(answerLines, margin + 12, currentY + 3, textOptions);
    } else {
      pdf.setTextColor(156, 163, 175); // #9ca3af
      pdf.setFont('helvetica', 'italic');
      pdf.text('Não respondida', margin + 12, currentY + 3);
    }
    
    return startY + totalHeight + 8; // Retorna nova posição Y com espaçamento
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private static addFooter(pdf: jsPDF, margin: number, contentWidth: number, pageHeight: number): void {
    const footerY = pageHeight - margin - 15;
    
    // Linha separadora
    pdf.setDrawColor(226, 232, 240); // #e2e8f0
    pdf.setLineWidth(0.3);
    pdf.line(margin, footerY, margin + contentWidth, footerY);
    
    // Texto do rodapé
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184); // #94a3b8
    
    const footerText = 'Gerado automaticamente pela Plataforma DIP-AI';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, margin + (contentWidth - footerWidth) / 2, footerY + 8);
    
    // Data/hora ISO
    pdf.setFontSize(8);
    pdf.setTextColor(203, 213, 225); // #cbd5e1
    const isoDate = new Date().toISOString();
    const isoWidth = pdf.getTextWidth(isoDate);
    pdf.text(isoDate, margin + (contentWidth - isoWidth) / 2, footerY + 15);
  }

  /**
   * Converte cor hexadecimal para RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Obtém as cores dos campos baseado no ID e status de preenchimento
   */
  private static getFieldColors(id: number, filled: boolean): { background: string; border: string; shadow: string; indicator: string } {
    if (id >= 1 && id <= 6) {
      return filled
        ? { background: '#dbeafe', border: '#3b82f6', shadow: '0 4px 6px rgba(59, 130, 246, 0.1)', indicator: '#3b82f6' }
        : { background: '#eff6ff', border: '#93c5fd', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#3b82f6' };
    } else if (id >= 7 && id <= 12) {
      return filled
        ? { background: '#fef3c7', border: '#f59e0b', shadow: '0 4px 6px rgba(245, 158, 11, 0.1)', indicator: '#facc15' }
        : { background: '#fffbeb', border: '#fcd34d', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#facc15' };
    } else if (id >= 13 && id <= 16) {
      return filled
        ? { background: '#fed7aa', border: '#f97316', shadow: '0 4px 6px rgba(249, 115, 22, 0.1)', indicator: '#f97316' }
        : { background: '#fff7ed', border: '#fdba74', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#f97316' };
    } else if (id >= 17 && id <= 19) {
      return filled
        ? { background: '#fecaca', border: '#ef4444', shadow: '0 4px 6px rgba(239, 68, 68, 0.1)', indicator: '#ef4444' }
        : { background: '#fef2f2', border: '#fca5a5', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#ef4444' };
    } else if (id >= 20 && id <= 28) {
      return filled
        ? { background: '#bbf7d0', border: '#22c55e', shadow: '0 4px 6px rgba(34, 197, 94, 0.1)', indicator: '#22c55e' }
        : { background: '#f0fdf4', border: '#86efac', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#22c55e' };
    }
    // Default
    return filled
      ? { background: '#f3f4f6', border: '#6b7280', shadow: '0 4px 6px rgba(107, 114, 128, 0.1)', indicator: '#6b7280' }
      : { background: '#f9fafb', border: '#d1d5db', shadow: '0 1px 3px rgba(0,0,0,0.1)', indicator: '#6b7280' };
  }

  /**
   * Escapa caracteres HTML para prevenir problemas de renderização
   */
  private static escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");
  }

  /**
   * Captura screenshot do canvas atual (método alternativo)
   */
  static async exportCurrentView(fileName: string): Promise<void> {
    try {
      // Procurar pelo container principal do canvas
      const canvasContainer = document.querySelector('.canvas-grid') || 
                             document.querySelector('[data-canvas-grid]') ||
                             document.querySelector('.p-6'); // fallback para o container de padding

      if (!canvasContainer) {
        throw new Error('Não foi possível encontrar o container do canvas');
      }

      const canvas = await html2canvas(canvasContainer as HTMLElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff'
      });

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`DIP-AI_${fileName}_screenshot.pdf`);
    } catch (error) {
      console.error('Erro ao capturar view atual:', error);
      throw new Error('Erro ao capturar tela atual. Tente a exportação padrão.');
    }
  }
}
