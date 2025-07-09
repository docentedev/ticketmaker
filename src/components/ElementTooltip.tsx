import React from 'react';
import type { ElementTooltipProps } from '../types/props';
import type { TextElement, QRElement, ImageElement } from '../types';

const ElementTooltip: React.FC<ElementTooltipProps> = ({ selectedElement, onUpdateElement, onDeleteElement }) => {
  if (!selectedElement) {
    return (
      <div className="element-tooltip">
        <p className="no-element-selected">
          Doble clic en un elemento del ticket para editarlo.
        </p>
      </div>
    );
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onUpdateElement(selectedElement.id, { content: e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateElement(selectedElement.id, { color: e.target.value });
  };

  const handleFontSizeChange = (delta: number) => {
    if (selectedElement.type === 'text') {
      const textElement = selectedElement as TextElement;
      onUpdateElement(selectedElement.id, { fontSize: Math.max(8, textElement.fontSize + delta) });
    }
  };

  const handleQRSizeChange = (delta: number) => {
    if (selectedElement.type === 'qr') {
      const qrElement = selectedElement as QRElement;
      onUpdateElement(selectedElement.id, { size: Math.max(20, Math.min(200, qrElement.size + delta)) });
    }
  };

  const handleQRSizeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedElement.type === 'qr') {
      onUpdateElement(selectedElement.id, { size: parseInt(e.target.value) });
    }
  };

  const handleQRLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedElement.type === 'qr') {
      onUpdateElement(selectedElement.id, { level: e.target.value as 'L' | 'M' | 'Q' | 'H' });
    }
  };

  const toggleFontWeight = () => {
    if (selectedElement.type === 'text') {
      const textElement = selectedElement as TextElement;
      onUpdateElement(selectedElement.id, {
        fontWeight: textElement.fontWeight === 'bold' ? 'normal' : 'bold',
      });
    }
  };

  const toggleFontStyle = () => {
    if (selectedElement.type === 'text') {
      const textElement = selectedElement as TextElement;
      onUpdateElement(selectedElement.id, {
        fontStyle: textElement.fontStyle === 'italic' ? 'normal' : 'italic',
      });
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedElement.type === 'text') {
      onUpdateElement(selectedElement.id, { fontFamily: e.target.value });
    }
  };

  // Funciones para manejar elementos de imagen
  const handleImageSizeChange = (property: 'width' | 'height', delta: number) => {
    if (selectedElement.type === 'image') {
      const imageElement = selectedElement as ImageElement;
      const currentValue = imageElement[property];
      const newValue = Math.max(20, Math.min(400, currentValue + delta));
      onUpdateElement(selectedElement.id, { [property]: newValue });
    }
  };

  const handleImageSizeSlider = (property: 'width' | 'height', value: number) => {
    if (selectedElement.type === 'image') {
      onUpdateElement(selectedElement.id, { [property]: value });
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedElement.type === 'image') {
      const opacity = parseFloat(e.target.value);
      onUpdateElement(selectedElement.id, { opacity });
    }
  };

  const handleRotationChange = (delta: number) => {
    if (selectedElement.type === 'image') {
      const imageElement = selectedElement as ImageElement;
      const newRotation = (imageElement.rotation + delta) % 360;
      onUpdateElement(selectedElement.id, { rotation: newRotation });
    }
  };

  const handleRotationSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedElement.type === 'image') {
      const rotation = parseInt(e.target.value);
      onUpdateElement(selectedElement.id, { rotation });
    }
  };

  return (
    <div className="element-tooltip">
      <h3>Editar Elemento</h3>
      {selectedElement.type === 'text' && (
        <>
          <div className="input-group">
            <label htmlFor="text-content">Contenido de Texto:</label>
            <textarea
              id="text-content"
              value={selectedElement.content}
              onChange={handleContentChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="text-color">Color:</label>
            <input
              id="text-color"
              type="color"
              value={(selectedElement as TextElement).color}
              onChange={handleColorChange}
            />
          </div>
          <div className="input-group">
            <label>Tamaño de Fuente:</label>
            <div className="font-size-controls">
              <button onClick={() => handleFontSizeChange(-2)}>-</button>
              <span>{(selectedElement as TextElement).fontSize}px</span>
              <button onClick={() => handleFontSizeChange(2)}>+</button>
            </div>
          </div>
          <div className="input-group">
            <label>Estilos:</label>
            <div className="style-controls">
              <button
                onClick={toggleFontWeight}
                className={(selectedElement as TextElement).fontWeight === 'bold' ? 'active' : ''}
              >
                Negrita
              </button>
              <button
                onClick={toggleFontStyle}
                className={(selectedElement as TextElement).fontStyle === 'italic' ? 'active' : ''}
              >
                Cursiva
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="font-family">Tipografía:</label>
            <select
              id="font-family"
              value={(selectedElement as TextElement).fontFamily}
              onChange={handleFontFamilyChange}
              className="font-family-select"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Palatino">Palatino</option>
              <option value="Garamond">Garamond</option>
            </select>
          </div>
        </>
      )}

      {selectedElement.type === 'qr' && (
        <>
          <div className="input-group">
            <label htmlFor="qr-content">Contenido QR:</label>
            <input
              id="qr-content"
              type="text"
              value={selectedElement.content}
              onChange={handleContentChange}
            />
          </div>
          <div className="input-group">
            <label>Tamaño del QR:</label>
            <div className="font-size-controls">
              <button onClick={() => handleQRSizeChange(-10)}>-</button>
              <span>{(selectedElement as QRElement).size}px</span>
              <button onClick={() => handleQRSizeChange(10)}>+</button>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="10"
              value={(selectedElement as QRElement).size}
              onChange={handleQRSizeSlider}
              className="size-slider"
            />
          </div>
          <div className="input-group">
            <label htmlFor="qr-level">Nivel de Corrección:</label>
            <select
              id="qr-level"
              value={(selectedElement as QRElement).level}
              onChange={handleQRLevelChange}
            >
              <option value="L">L - Bajo (7%)</option>
              <option value="M">M - Medio (15%)</option>
              <option value="Q">Q - Alto (25%)</option>
              <option value="H">H - Muy Alto (30%)</option>
            </select>
          </div>
        </>
      )}

      {selectedElement.type === 'image' && (
        <>
          <div className="input-group">
            <label>Ancho de la Imagen:</label>
            <div className="font-size-controls">
              <button onClick={() => handleImageSizeChange('width', -10)}>-</button>
              <span>{(selectedElement as ImageElement).width}px</span>
              <button onClick={() => handleImageSizeChange('width', 10)}>+</button>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="10"
              value={(selectedElement as ImageElement).width}
              onChange={(e) => handleImageSizeSlider('width', parseInt(e.target.value))}
              className="size-slider"
            />
          </div>
          <div className="input-group">
            <label>Alto de la Imagen:</label>
            <div className="font-size-controls">
              <button onClick={() => handleImageSizeChange('height', -10)}>-</button>
              <span>{(selectedElement as ImageElement).height}px</span>
              <button onClick={() => handleImageSizeChange('height', 10)}>+</button>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="10"
              value={(selectedElement as ImageElement).height}
              onChange={(e) => handleImageSizeSlider('height', parseInt(e.target.value))}
              className="size-slider"
            />
          </div>
          <div className="input-group">
            <label>Opacidad: {(selectedElement as ImageElement).opacity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={(selectedElement as ImageElement).opacity}
              onChange={handleOpacityChange}
              className="opacity-slider"
            />
          </div>
          <div className="input-group">
            <label>Rotación:</label>
            <div className="font-size-controls">
              <button onClick={() => handleRotationChange(-15)}>-</button>
              <span>{(selectedElement as ImageElement).rotation}°</span>
              <button onClick={() => handleRotationChange(15)}>+</button>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={(selectedElement as ImageElement).rotation}
              onChange={handleRotationSlider}
              className="rotation-slider"
            />
          </div>
        </>
      )}

      <button className="delete-button" onClick={() => onDeleteElement(selectedElement.id)}>
        Eliminar Elemento
      </button>
    </div>
  );
};

export default ElementTooltip;
