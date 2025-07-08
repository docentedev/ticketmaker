import type { TextElement, QRElement, ImageElement, TicketElement } from '../types';

// Factory functions para crear nuevos elementos
export const createTextElement = (): TextElement => {
  return {
    id: `text-${Date.now()}`, // ID único
    type: 'text',
    content: 'Nuevo Texto',
    x: 50, // Posición inicial X
    y: 50, // Posición inicial Y
    color: '#000000', // Color predeterminado
    fontSize: 16, // Tamaño de fuente predeterminado
    fontWeight: 'normal', // Estilo de fuente predeterminado
    fontStyle: 'normal', // Estilo de fuente predeterminado
  };
};

export const createQRElement = (): QRElement => {
  return {
    id: `qr-${Date.now()}`, // ID único
    type: 'qr',
    content: 'https://example.com', // Contenido predeterminado del QR
    x: 50, // Posición inicial X
    y: 50, // Posición inicial Y
    size: 60, // Tamaño predeterminado del QR
    level: 'M', // Nivel de corrección de errores medio
  };
};

export const createImageElement = (src: string): ImageElement => {
  return {
    id: `image-${Date.now()}`, // ID único
    type: 'image',
    src, // Data URL de la imagen
    x: 50, // Posición inicial X
    y: 50, // Posición inicial Y
    width: 100, // Ancho predeterminado
    height: 100, // Alto predeterminado
    opacity: 1, // Sin transparencia inicialmente
    rotation: 0, // Sin rotación inicial
  };
};

// Utilidad para calcular los límites de arrastre
export const calculateDragBounds = (
  element: TicketElement,
  ticketWidth: number,
  ticketHeight: number
): { finalX: number; finalY: number } => {
  let elementWidth = 100; // Default width
  let elementHeight = 30; // Default height
  
  if (element.type === 'qr') {
    const qrElement = element as QRElement;
    elementWidth = qrElement.size;
    elementHeight = qrElement.size;
  } else if (element.type === 'image') {
    const imageElement = element as ImageElement;
    elementWidth = imageElement.width;
    elementHeight = imageElement.height;
  }

  const snappedX = Math.round(element.x / 10) * 10;
  const snappedY = Math.round(element.y / 10) * 10;

  // Asegurarse de que el elemento no se salga de los límites
  const finalX = Math.max(0, Math.min(snappedX, ticketWidth - elementWidth));
  const finalY = Math.max(0, Math.min(snappedY, ticketHeight - elementHeight));

  return { finalX, finalY };
};
