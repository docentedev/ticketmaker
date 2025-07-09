import type { TicketElement, TicketConfig, CSVRow, TemplateVariable } from '../types';

// Función para encontrar variables en una cadena de texto
export const findTemplateVariables = (text: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
};

// Función para reemplazar variables en una cadena de texto
export const replaceTemplateVariables = (text: string, data: CSVRow): string => {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const key = variable.trim();
    const value = data[key];
    return typeof value === 'string' ? value : match; // Si no existe la variable, mantener el texto original
  });
};

// Función para encontrar todas las variables en un TicketConfig
export const findAllVariablesInConfig = (config: TicketConfig): TemplateVariable[] => {
  const allVariables = new Set<string>();
  
  config.elements.forEach(element => {
    if (element.type === 'text' || element.type === 'qr') {
      const variables = findTemplateVariables(element.content);
      variables.forEach(variable => allVariables.add(variable));
    }
  });
  
  return Array.from(allVariables).map(name => ({ name }));
};

// Función para crear un ticket con variables reemplazadas
export const createTicketFromTemplate = (template: TicketConfig, data: CSVRow): TicketConfig => {
  const processedElements: TicketElement[] = template.elements.map(element => {
    if (element.type === 'text' || element.type === 'qr') {
      return {
        ...element,
        content: replaceTemplateVariables(element.content, data)
      };
    }
    return element; // Los elementos de imagen no se procesan
  });

  return {
    ...template,
    elements: processedElements
  };
};

// Función para parsear CSV
export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('El CSV debe tener al menos una fila de encabezados y una fila de datos');
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    const row: CSVRow = { done: false };
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Convertir 'true'/'false' a boolean para la columna 'done'
      if (header.toLowerCase() === 'done') {
        row[header] = value.toLowerCase() === 'true';
      } else {
        row[header] = value;
      }
    });
    
    rows.push(row);
  }

  return rows;
};

// Función para validar CSV contra variables del template
export const validateCSVData = (csvData: CSVRow[], variables: TemplateVariable[]): string[] => {
  const errors: string[] = [];
  const csvHeaders = csvData.length > 0 ? Object.keys(csvData[0]) : [];
  
  // Verificar que todas las variables del template están en el CSV
  variables.forEach(variable => {
    if (!csvHeaders.includes(variable.name)) {
      errors.push(`La variable "${variable.name}" no se encontró en el CSV`);
    }
  });
  
  // Verificar que el CSV tiene la columna 'done'
  if (!csvHeaders.includes('done')) {
    errors.push('El CSV debe tener una columna "done" para controlar el estado de procesamiento');
  }
  
  return errors;
};

// Función para generar nombre de archivo único
export const generateFileName = (prefix: string, rowIndex: number, data: CSVRow): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const identifier = data.nombre || data.id || data.email || `row-${rowIndex}`;
  return `${prefix}-${identifier}-${timestamp}`;
};

// Función para crear y descargar un archivo
export const downloadFile = (content: string | Blob, filename: string, mimeType: string = 'application/octet-stream') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar el URL después de un momento
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Función para actualizar el CSV con el estado 'done'
export const updateCSVDoneStatus = (csvData: CSVRow[], processedIndices: number[]): string => {
  const updatedData = csvData.map((row, index) => {
    if (processedIndices.includes(index)) {
      return { ...row, done: true };
    }
    return row;
  });
  
  // Convertir de vuelta a CSV
  const headers = Object.keys(updatedData[0]);
  const csvLines = [
    headers.join(','),
    ...updatedData.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'boolean' ? value.toString() : `"${value}"`;
      }).join(',')
    )
  ];
  
  return csvLines.join('\n');
};
