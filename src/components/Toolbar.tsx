import React from 'react';
import type { ToolbarProps } from '../types/props';

const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddQR,
  onAddImage,
  ticketWidth,
  setTicketWidth,
  ticketHeight,
  setTicketHeight,
  onImageUpload,
  onDownloadTicket,
  onSaveCanvas,
  onLoadCanvas,
  onBatchProcess,
}) => {
  return (
    <div className="toolbar">
      <button onClick={onAddText}>Añadir Texto</button>
      <button onClick={onAddQR}>Añadir QR</button>
      <button onClick={onAddImage}>🖼️ Añadir Imagen</button>

      <div className="input-group">
        <label htmlFor="ticket-width">Ancho (px):</label>
        <input
          id="ticket-width"
          type="number"
          value={ticketWidth}
          onChange={(e) => setTicketWidth(Math.max(100, parseInt(e.target.value) || 0))}
          min="100"
        />
      </div>
      <div className="input-group">
        <label htmlFor="ticket-height">Alto (px):</label>
        <input
          id="ticket-height"
          type="number"
          value={ticketHeight}
          onChange={(e) => setTicketHeight(Math.max(100, parseInt(e.target.value) || 0))}
          min="100"
        />
      </div>
      <div className="input-group">
        <label htmlFor="background-upload">Fondo:</label>
        <input
          id="background-upload"
          type="file"
          accept="image/*"
          onChange={onImageUpload}
        />
        <label htmlFor="background-upload">Subir Imagen</label>
      </div>
      
      <div className="save-load-section">
        <button onClick={onSaveCanvas} className="save-button" title="Guardar la configuración actual del canvas en un archivo JSON">
          💾 Guardar Canvas
        </button>
        
        <div className="input-group">
          <input
            id="canvas-load"
            type="file"
            accept=".json"
            onChange={onLoadCanvas}
          />
          <label htmlFor="canvas-load" title="Cargar una configuración de canvas desde un archivo JSON">
            📁 Cargar Canvas
          </label>
        </div>

        <button onClick={onBatchProcess} className="batch-button" title="Procesar lote desde archivo CSV">
          🚀 Lote CSV
        </button>
      </div>
      
      <button onClick={onDownloadTicket}>📥 Descargar Ticket</button>
    </div>
  );
};

export default Toolbar;
