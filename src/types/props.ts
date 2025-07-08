import React from 'react';
import type { TicketElement } from '../types';
import type { DragEndEvent } from '@dnd-kit/core';

export interface ToolbarProps {
  onAddText: () => void;
  onAddQR: () => void;
  onAddImage: () => void;
  ticketWidth: number;
  setTicketWidth: (width: number) => void;
  ticketHeight: number;
  setTicketHeight: (height: number) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTicket: () => Promise<void>;
  onSaveCanvas: () => void;
  onLoadCanvas: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TicketCanvasProps {
  width: number;
  height: number;
  background: string;
  elements: TicketElement[];
  selectedElementId: string | null;
  isCapturing: boolean;
  onSelectElement: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export interface ElementProps {
  element: TicketElement;
  isSelected: boolean;
  isCapturing: boolean;
  onSelectElement: (id: string) => void;
}

export interface ElementTooltipProps {
  selectedElement: TicketElement | undefined;
  onUpdateElement: (id: string, newProps: Partial<TicketElement>) => void;
  onDeleteElement: (id: string) => void;
}
