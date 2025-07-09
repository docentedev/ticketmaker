import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import type { DragEndEvent } from '@dnd-kit/core';

// Import types
import type { TicketElement, TicketConfig } from './types';

// Import components
import Toolbar from './components/Toolbar';
import TicketCanvas from './components/TicketCanvas';
import ElementTooltip from './components/ElementTooltip';
import BatchProcessor from './components/BatchProcessor';
import Modal from './components/Modal';

// Import custom hooks
import { useModal } from './hooks/useModal';

// Import utilities
import { saveCanvasConfig, loadCanvasConfig } from './utils/canvasManager';
import { createTextElement, createQRElement, createImageElement } from './utils/elementUtils';

// Componente principal de la aplicación
function App() {
  // Estados del ticket
  const [elements, setElements] = useState<TicketElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [ticketWidth, setTicketWidth] = useState<number>(400);
  const [ticketHeight, setTicketHeight] = useState<number>(200);
  const [ticketBackground, setTicketBackground] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isBatchProcessorOpen, setIsBatchProcessorOpen] = useState<boolean>(false);
  
  // Hook para manejar modales
  const { modal, showModal, closeModal } = useModal();

  // Referencia al contenedor del ticket para html2canvas
  const ticketRef = useRef<HTMLDivElement>(null);

  // Cargar configuración desde localStorage al iniciar la aplicación
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('ticketConfig');
      if (savedConfig) {
        const config: TicketConfig = JSON.parse(savedConfig);
        setElements(config.elements || []);
        setTicketWidth(config.ticketWidth || 400);
        setTicketHeight(config.ticketHeight || 200);
        setTicketBackground(config.ticketBackground || '');
      }
    } catch (error) {
      console.error("Error al cargar la configuración de localStorage:", error);
      // Limpiar localStorage si hay un error de parseo
      localStorage.removeItem('ticketConfig');
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  // Guardar configuración en localStorage cada vez que cambie el estado relevante
  useEffect(() => {
    try {
      const configToSave: TicketConfig = {
        elements,
        ticketWidth,
        ticketHeight,
        ticketBackground,
      };
      localStorage.setItem('ticketConfig', JSON.stringify(configToSave));
    } catch (error) {
      console.error("Error al guardar la configuración en localStorage:", error);
    }
  }, [elements, ticketWidth, ticketHeight, ticketBackground]); // Dependencias del efecto

  // Función para añadir un nuevo elemento de texto
  const handleAddText = () => {
    const newTextElement = createTextElement();
    setElements((prevElements) => [...prevElements, newTextElement]);
    setSelectedElementId(newTextElement.id); // Seleccionar el nuevo elemento
  };

  // Función para añadir un nuevo elemento de código QR
  const handleAddQR = () => {
    const newQRElement = createQRElement();
    setElements((prevElements) => [...prevElements, newQRElement]);
    setSelectedElementId(newQRElement.id); // Seleccionar el nuevo elemento
  };

  // Función para añadir un nuevo elemento de imagen
  const handleAddImage = () => {
    // Crear un input temporal para seleccionar la imagen
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageSrc = e.target?.result as string;
          if (imageSrc) {
            const newImageElement = createImageElement(imageSrc);
            setElements((prevElements) => [...prevElements, newImageElement]);
            setSelectedElementId(newImageElement.id); // Seleccionar el nuevo elemento
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Función para seleccionar un elemento al hacer doble clic
  const handleSelectElement = useCallback((id: string) => {
    // Si el elemento ya está seleccionado, deseleccionarlo
    if (selectedElementId === id) {
      setSelectedElementId(null);
    } else {
      setSelectedElementId(id);
    }
  }, [selectedElementId]);

  // Función para actualizar las propiedades de un elemento
  const handleUpdateElement = useCallback((id: string, newProps: Partial<TicketElement>) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, ...newProps } as TicketElement : el
      )
    );
  }, []);

  // Función para eliminar un elemento
  const handleDeleteElement = useCallback((id: string) => {
    setElements((prevElements) => prevElements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null); // Deseleccionar si el elemento eliminado estaba seleccionado
    }
  }, [selectedElementId]);

  // Función para manejar el final del arrastre de un elemento
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const id = active.id as string;
    const currentElement = elements.find(el => el.id === id);
    if (!currentElement) return;

    // Calcular nueva posición
    const newX = currentElement.x + delta.x;
    const newY = currentElement.y + delta.y;

    // Ajustar la posición a la cuadrícula de 10x10px
    const snappedX = Math.round(newX / 10) * 10;
    const snappedY = Math.round(newY / 10) * 10;

    // Limitar el arrastre a los límites del ticket
    let finalX = snappedX;
    let finalY = snappedY;

    let elementWidth = 100; // Default width
    let elementHeight = 30; // Default height
    
    if (currentElement.type === 'qr') {
      const qrElement = currentElement as import('./types').QRElement;
      elementWidth = qrElement.size;
      elementHeight = qrElement.size;
    } else if (currentElement.type === 'image') {
      const imageElement = currentElement as import('./types').ImageElement;
      elementWidth = imageElement.width;
      elementHeight = imageElement.height;
    }

    // Asegurarse de que el elemento no se salga de los límites
    finalX = Math.max(0, Math.min(finalX, ticketWidth - elementWidth));
    finalY = Math.max(0, Math.min(finalY, ticketHeight - elementHeight));

    handleUpdateElement(id, { x: finalX, y: finalY });
  }, [elements, handleUpdateElement, ticketWidth, ticketHeight]);

  // Función para manejar la subida de la imagen de fondo
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTicketBackground(reader.result); // Almacenar como Data URL
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para descargar el ticket como imagen PNG
  const handleDownloadTicket = async (): Promise<void> => {
    setIsCapturing(true); // Ocultar bordes de selección

    // Esperar un pequeño tiempo para que React re-renderice y oculte los bordes
    setTimeout(async () => {
      if (ticketRef.current) {
        try {
          const canvas = await html2canvas(ticketRef.current, {
            useCORS: true, // Importante para imágenes de fondo externas
            allowTaint: true, // Puede ser necesario para imágenes locales
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
          showModal(
            'Error al generar imagen',
            'No se pudo generar la imagen del ticket. Asegúrate de que la imagen de fondo no tenga restricciones CORS.',
            'error'
          );
        } finally {
          setIsCapturing(false); // Restaurar bordes de selección
        }
      }
    }, 50); // Pequeño retraso
  };

  // Función para guardar la configuración del lienzo
  const handleSaveCanvas = () => {
    const canvasConfig: TicketConfig = {
      elements,
      ticketWidth,
      ticketHeight,
      ticketBackground,
    };
    saveCanvasConfig(canvasConfig);
  };

  // Función para cargar la configuración del lienzo
  const handleLoadCanvas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar que sea un archivo JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      showModal(
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
        setElements(config.elements);
        setTicketWidth(config.ticketWidth || 400);
        setTicketHeight(config.ticketHeight || 200);
        setTicketBackground(config.ticketBackground || '');
        setSelectedElementId(null);
        
        showModal(
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
        showModal(
          'Error al cargar archivo',
          <div>
            <p>{error}</p>
            <p>Asegúrate de que sea un archivo de configuración válido.</p>
          </div>,
          'error'
        );
      }
    );
    
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    event.target.value = '';
  };

  // Función para manejar el procesamiento en lote
  const handleBatchProcess = () => {
    // Abrir el modal del procesador en lote
    setIsBatchProcessorOpen(true);
  };

  // Obtener el elemento seleccionado para pasarlo al ElementTooltip
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className="app-container">
      {/* Barra de herramientas */}
      <Toolbar
        onAddText={handleAddText}
        onAddQR={handleAddQR}
        onAddImage={handleAddImage}
        ticketWidth={ticketWidth}
        setTicketWidth={setTicketWidth}
        ticketHeight={ticketHeight}
        setTicketHeight={setTicketHeight}
        onImageUpload={handleImageUpload}
        onDownloadTicket={handleDownloadTicket}
        onSaveCanvas={handleSaveCanvas}
        onLoadCanvas={handleLoadCanvas}
        onBatchProcess={handleBatchProcess}
      />

      {/* Contenido principal: Canvas del ticket y panel de edición */}
      <div className="main-content">
        {/* Canvas del Ticket */}
        <TicketCanvas
          ref={ticketRef}
          width={ticketWidth}
          height={ticketHeight}
          background={ticketBackground}
          elements={elements}
          selectedElementId={selectedElementId}
          isCapturing={isCapturing}
          onSelectElement={handleSelectElement}
          onDragEnd={handleDragEnd}
        />

        {/* Panel de edición de elementos */}
        <ElementTooltip
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
        />
      </div>

      {/* Procesador en lote */}
      <BatchProcessor
        template={{
          elements,
          ticketWidth,
          ticketHeight,
          ticketBackground,
        }}
        isOpen={isBatchProcessorOpen}
        onClose={() => setIsBatchProcessorOpen(false)}
        onShowModal={showModal}
      />

      {/* Modal para mensajes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        type={modal.type}
      >
        {modal.content}
      </Modal>
    </div>
  );
}

export default App;