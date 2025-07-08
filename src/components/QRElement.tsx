import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { QRCodeSVG } from 'qrcode.react';
import type { ElementProps } from '../types/props';
import type { QRElement as QRElementType } from '../types';

const QRElement: React.FC<ElementProps> = ({ element, isSelected, isCapturing, onSelectElement }) => {
  const qrElement = element as QRElementType;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: qrElement.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as const,
    left: qrElement.x,
    top: qrElement.y,
    width: qrElement.size,
    height: qrElement.size,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`ticket-element qr-element ${isSelected && !isCapturing ? 'selected' : ''} ${isCapturing ? 'capturing' : ''}`}
      onDoubleClick={() => onSelectElement(qrElement.id)}
    >
      <QRCodeSVG value={qrElement.content} size={qrElement.size} level={qrElement.level} />
    </div>
  );
};

export default QRElement;
