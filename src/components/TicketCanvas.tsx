import React from 'react';
import { DndContext } from '@dnd-kit/core';
import type { TicketCanvasProps } from '../types/props';
import type { TicketElement } from '../types';
import TextElement from './TextElement';
import QRElement from './QRElement';
import ImageElement from './ImageElement';

const TicketCanvas = React.forwardRef<HTMLDivElement, TicketCanvasProps>(({
  width,
  height,
  background,
  elements,
  selectedElementId,
  isCapturing,
  onSelectElement,
  onDragEnd,
}, ref) => {
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div
        ref={ref}
        className="ticket-canvas-container"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: background ? `url(${background})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {elements.map((element: TicketElement) => {
          if (element.type === 'text') {
            return (
              <TextElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isCapturing={isCapturing}
                onSelectElement={onSelectElement}
              />
            );
          } else if (element.type === 'qr') {
            return (
              <QRElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isCapturing={isCapturing}
                onSelectElement={onSelectElement}
              />
            );
          } else if (element.type === 'image') {
            return (
              <ImageElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isCapturing={isCapturing}
                onSelectElement={onSelectElement}
              />
            );
          }
          return null;
        })}
      </div>
    </DndContext>
  );
});

TicketCanvas.displayName = 'TicketCanvas';

export default TicketCanvas;
