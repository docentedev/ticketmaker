import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ElementProps } from '../types/props';
import type { ImageElement as ImageElementType } from '../types';

// Componente para elementos de imagen
const ImageElement: React.FC<ElementProps> = ({ element, isSelected, isCapturing, onSelectElement }) => {
  const imageElement = element as ImageElementType;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: imageElement.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as const,
    left: imageElement.x,
    top: imageElement.y,
    width: imageElement.width,
    height: imageElement.height,
    opacity: imageElement.opacity,
    rotate: `${imageElement.rotation}deg`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`ticket-element image-element ${isSelected && !isCapturing ? 'selected' : ''} ${isCapturing ? 'capturing' : ''}`}
      onDoubleClick={() => onSelectElement(imageElement.id)}
    >
      <img
        src={imageElement.src}
        alt="Imagen del ticket"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none', // Evitar interferencia con el drag
        }}
        draggable={false} // Evitar arrastre nativo de la imagen
      />
    </div>
  );
};

export default ImageElement;
