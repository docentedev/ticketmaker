import type { TicketConfig } from '../types';

// Función para guardar la configuración del lienzo
export const saveCanvasConfig = (config: TicketConfig): void => {
  try {
    // Crear contenido del archivo JSON
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `ticket-canvas-${timestamp}.json`;
    
    // Crear link de descarga
    const url = URL.createObjectURL(dataBlob);
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = fileName;
    linkElement.style.display = 'none';
    
    // Ejecutar descarga
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    // Limpiar URL object
    URL.revokeObjectURL(url);
    
    console.log(`✅ Configuración guardada exitosamente en: ${fileName}`);
    
  } catch (error) {
    console.error('❌ Error al guardar la configuración:', error);
    alert('Error al guardar el archivo. Por favor, intenta nuevamente.');
  }
};

// Función para validar una configuración cargada
export const validateCanvasConfig = (config: unknown): config is TicketConfig => {
  if (typeof config !== 'object' || config === null) {
    throw new Error('El archivo no contiene un objeto JSON válido');
  }
  
  const configObj = config as Record<string, unknown>;
  
  if (!configObj.elements || !Array.isArray(configObj.elements)) {
    throw new Error('El archivo no contiene una configuración válida de elementos');
  }
  
  if (typeof configObj.ticketWidth !== 'number' || typeof configObj.ticketHeight !== 'number') {
    throw new Error('El archivo no contiene dimensiones válidas del ticket');
  }
  
  return true;
};

// Función para cargar la configuración del lienzo
export const loadCanvasConfig = (
  file: File,
  onSuccess: (config: TicketConfig) => void,
  onError: (error: string) => void
): void => {
  // Verificar que sea un archivo JSON
  if (!file.name.toLowerCase().endsWith('.json')) {
    onError('Por favor, selecciona un archivo JSON válido.');
    return;
  }

  console.log(`📁 Cargando configuración desde: ${file.name}`);

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const config: TicketConfig = JSON.parse(result);
        
        // Validar la configuración
        if (validateCanvasConfig(config)) {
          onSuccess(config);
          
          console.log('✅ Configuración cargada exitosamente:', config);
          console.log(`📊 Elementos cargados: ${config.elements.length}`);
          console.log(`📐 Dimensiones: ${config.ticketWidth}x${config.ticketHeight}px`);
          
          alert(`✅ Configuración cargada exitosamente!\n📊 Elementos: ${config.elements.length}\n📐 Dimensiones: ${config.ticketWidth}x${config.ticketHeight}px`);
        }
      } else {
        throw new Error('No se pudo leer el contenido del archivo');
      }
    } catch (error) {
      console.error('❌ Error al cargar la configuración:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError(`❌ Error al cargar el archivo:\n${errorMessage}\n\nAsegúrate de que sea un archivo de configuración válido.`);
    }
  };
  
  reader.onerror = () => {
    console.error('❌ Error al leer el archivo');
    onError('❌ Error al leer el archivo. Por favor, intenta nuevamente.');
  };
  
  reader.readAsText(file);
};
