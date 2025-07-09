import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ElementProps } from '../types/props';
import type { TextElement as TextElementType } from '../types';

const TextElement: React.FC<ElementProps> = ({ element, isSelected, isCapturing, onSelectElement }) => {
  const textElement = element as TextElementType;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: textElement.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as const,
    left: textElement.x,
    top: textElement.y,
    color: textElement.color,
    fontSize: `${textElement.fontSize}px`,
    fontWeight: textElement.fontWeight,
    fontStyle: textElement.fontStyle,
    fontFamily: textElement.fontFamily,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`ticket-element text-element ${isSelected && !isCapturing ? 'selected' : ''} ${isCapturing ? 'capturing' : ''}`}
      onDoubleClick={() => onSelectElement(textElement.id)}
    >
      {textElement.content}
    </div>
  );
};

export default TextElement;
