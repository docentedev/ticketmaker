// Tipos e interfaces para el Ticket Customizer

export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  fontFamily: string;
}

export interface QRElement {
  id: string;
  type: 'qr';
  content: string;
  x: number;
  y: number;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string; // Data URL de la imagen
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number; // 0-1 para transparencia
  rotation: number; // Ángulo de rotación en grados
}

export type TicketElement = TextElement | QRElement | ImageElement;

export interface TicketConfig {
  elements: TicketElement[];
  ticketWidth: number;
  ticketHeight: number;
  ticketBackground: string;
}

// Tipos para el sistema de plantillas y generación en lote
export interface CSVRow {
  [key: string]: string | boolean;
  done: boolean; // Indica si ya se procesó
}

export interface TemplateVariable {
  name: string; // Nombre de la variable sin {{}}
  defaultValue?: string;
}

export interface BatchJobConfig {
  template: TicketConfig; // Configuración base del ticket
  csvData: CSVRow[]; // Datos del CSV
  variables: TemplateVariable[]; // Variables encontradas en el template
  outputFormat: 'png' | 'json'; // Formato de salida
}

export interface BatchJobResult {
  processed: number;
  skipped: number;
  errors: string[];
  downloadUrls: string[];
}
