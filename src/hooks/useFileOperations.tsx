import React, { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import { saveCanvasConfig, loadCanvasConfig } from '../utils/canvasManager';
import type { TicketConfig } from '../types';

interface UseFileOperationsProps {
  elements: any[];
  ticketConfig: {
    ticketWidth: number;
    ticketHeight: number;
    ticketBackground: string;
  };
  onLoadConfig: (config: TicketConfig) => void;
  onShowModal: (title: string, content: React.ReactNode, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const useFileOperations = ({ 
  elements, 
  ticketConfig, 
  onLoadConfig, 
  onShowModal 
}: UseFileOperationsProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Este callback se manejará desde el componente padre
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDownloadTicket = useCallback(async (): Promise<void> => {
    setIsCapturing(true);

    setTimeout(async () => {
      if (ticketRef.current) {
        try {
          const canvas = await html2canvas(ticketRef.current, {
            useCORS: true,
            allowTaint: true,
          });
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = 'ticket_personalizado.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("Error al generar la imagen del ticket:", error);
          onShowModal(
            'Error al generar imagen',
            'No se pudo generar la imagen del ticket. Asegúrate de que la imagen de fondo no tenga restricciones CORS.',
            'error'
          );
        } finally {
          setIsCapturing(false);
        }
      }
    }, 50);
  }, [onShowModal]);

  const handleSaveCanvas = useCallback(() => {
    const canvasConfig: TicketConfig = {
      elements,
      ...ticketConfig
    };
    saveCanvasConfig(canvasConfig);
  }, [elements, ticketConfig]);

  const handleLoadCanvas = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      onShowModal(
        'Archivo inválido',
        'Por favor, selecciona un archivo JSON válido.',
        'warning'
      );
      event.target.value = '';
      return;
    }

    loadCanvasConfig(
      file,
      (config: TicketConfig) => {
        onLoadConfig(config);
        onShowModal(
          'Configuración cargada',
          <div className="modal-summary">
            <div className="modal-summary-item">
              <span className="modal-summary-label">📊 Elementos:</span>
              <span className="modal-summary-value">{config.elements.length}</span>
            </div>
            <div className="modal-summary-item">
              <span className="modal-summary-label">📐 Dimensiones:</span>
              <span className="modal-summary-value">{config.ticketWidth}x{config.ticketHeight}px</span>
            </div>
          </div>,
          'success'
        );
      },
      (error: string) => {
        onShowModal(
          'Error al cargar archivo',
          <div>
            <p>{error}</p>
            <p>Asegúrate de que sea un archivo de configuración válido.</p>
          </div>,
          'error'
        );
      }
    );
    
    event.target.value = '';
  }, [onLoadConfig, onShowModal]);

  return {
    ticketRef,
    isCapturing,
    handleImageUpload,
    handleDownloadTicket,
    handleSaveCanvas,
    handleLoadCanvas
  };
};
