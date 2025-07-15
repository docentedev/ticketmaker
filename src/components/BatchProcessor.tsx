import React, { useState } from 'react';
import QRCode from 'qrcode';
import type { TicketConfig, CSVRow, TemplateVariable } from '../types';
import {
  parseCSV,
  findAllVariablesInConfig,
  validateCSVData,
  validateFilenameTemplate,
  createTicketFromTemplate,
  generateFileName,
  downloadFile,
  updateCSVDoneStatus
} from '../utils/templateUtils';

interface BatchProcessorProps {
  template: TicketConfig;
  isOpen: boolean;
  onClose: () => void;
  onShowModal?: (title: string, content: React.ReactNode, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ template, isOpen, onClose, onShowModal }) => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [filenameTemplate, setFilenameTemplate] = useState<string>('ticket-{{Nombre}}');
  const [useFilenameTemplate, setUseFilenameTemplate] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [processedIndices, setProcessedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      onShowModal?.('Archivo inválido', 'Por favor, selecciona un archivo CSV válido.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        const foundVariables = findAllVariablesInConfig(template);
        const validationErrors = validateCSVData(parsedData, foundVariables);

        // Validar template de nombre de archivo si está habilitado
        if (useFilenameTemplate) {
          const filenameErrors = validateFilenameTemplate(filenameTemplate, parsedData);
          validationErrors.push(...filenameErrors);
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        setCsvData(parsedData);
        setVariables(foundVariables);
        setErrors([]);
        console.log(`✅ CSV cargado: ${parsedData.length} filas, ${foundVariables.length} variables`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setErrors([`Error al procesar CSV: ${errorMessage}`]);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const processBatch = async () => {
    if (csvData.length === 0) {
      onShowModal?.('Sin datos CSV', 'Por favor, carga un archivo CSV primero.', 'warning');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: csvData.length });
    const newProcessedIndices: number[] = [];
    const processingErrors: string[] = [];

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Saltar filas ya procesadas
        if (row.done) {
          console.log(`⏭️ Saltando fila ${i + 1} (ya procesada)`);
          continue;
        }

        setProgress({ current: i + 1, total: csvData.length });

        try {
          // Crear ticket con variables reemplazadas
          const processedTicket = createTicketFromTemplate(template, row);
          
          // Usar el canvas existente del template como base
          await renderAndDownloadTicket(processedTicket, i, row);

          newProcessedIndices.push(i);
          
          // Pequeña pausa para no sobrecargar el navegador
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          processingErrors.push(`Fila ${i + 1}: ${errorMessage}`);
          console.error(`❌ Error procesando fila ${i + 1}:`, error);
        }
      }

      // Actualizar CSV con el estado 'done'
      if (newProcessedIndices.length > 0) {
        const updatedCSV = updateCSVDoneStatus(csvData, newProcessedIndices);
        const csvFilename = generateFileName('updated-csv', 0, { done: false }) + '.csv';
        downloadFile(updatedCSV, csvFilename, 'text/csv');
      }

      setProcessedIndices([...processedIndices, ...newProcessedIndices]);
      setErrors(processingErrors);

      onShowModal?.(
        'Procesamiento completado',
        <div className="modal-summary">
          <div className="modal-summary-item">
            <span className="modal-summary-label">📊 Procesados:</span>
            <span className="modal-summary-value">{newProcessedIndices.length}</span>
          </div>
          <div className="modal-summary-item">
            <span className="modal-summary-label">❌ Errores:</span>
            <span className="modal-summary-value">{processingErrors.length}</span>
          </div>
          {processingErrors.length > 0 && (
            <div className="modal-error-list">
              <strong>Errores encontrados:</strong>
              <ul>
                {processingErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {processingErrors.length > 5 && (
                  <li>... y {processingErrors.length - 5} errores más</li>
                )}
              </ul>
            </div>
          )}
        </div>,
        newProcessedIndices.length > 0 ? 'success' : 'warning'
      );

    } catch (error) {
      console.error('❌ Error en procesamiento en lote:', error);
      onShowModal?.(
        'Error en procesamiento',
        'Error durante el procesamiento en lote. Revisa la consola para más detalles.',
        'error'
      );
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Función mejorada para renderizar y descargar ticket
  const renderAndDownloadTicket = async (config: TicketConfig, index: number, data: CSVRow): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Crear un canvas temporal
      const canvas = document.createElement('canvas');
      canvas.width = config.ticketWidth;
      canvas.height = config.ticketHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      // Función para cargar imagen de fondo si existe
      const loadBackgroundImage = (): Promise<void> => {
        return new Promise((bgResolve) => {
          if (config.ticketBackground) {
            const bgImg = new Image();
            bgImg.crossOrigin = 'anonymous';
            bgImg.onload = () => {
              ctx.drawImage(bgImg, 0, 0, config.ticketWidth, config.ticketHeight);
              bgResolve();
            };
            bgImg.onerror = () => {
              console.warn('No se pudo cargar la imagen de fondo, continuando sin ella');
              bgResolve();
            };
            bgImg.src = config.ticketBackground;
          } else {
            // Fondo blanco por defecto
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, config.ticketWidth, config.ticketHeight);
            bgResolve();
          }
        });
      };

      // Función para renderizar elementos
      const renderElements = async (): Promise<void> => {
        for (const element of config.elements) {
          try {
            if (element.type === 'text') {
              // Renderizar texto
              ctx.fillStyle = element.color;
              ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
              ctx.textBaseline = 'top';
              
              // Manejar texto multilínea
              const lines = element.content.split('\n');
              lines.forEach((line, lineIndex) => {
                ctx.fillText(line, element.x, element.y + (lineIndex * element.fontSize * 1.2));
              });
              
            } else if (element.type === 'qr') {
              // Generar QR code real usando la librería qrcode
              try {
                // Crear un canvas temporal para el QR
                const qrCanvas = document.createElement('canvas');
                await QRCode.toCanvas(qrCanvas, element.content, {
                  width: element.size,
                  margin: 1,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });
                
                // Dibujar el QR en el canvas principal
                ctx.drawImage(qrCanvas, element.x, element.y);
                
              } catch (qrError) {
                console.warn(`Error generando QR code para "${element.content}":`, qrError);
                // Fallback: dibujar un rectángulo simple
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.strokeRect(element.x, element.y, element.size, element.size);
                
                ctx.fillStyle = '#ff0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                  'QR Error', 
                  element.x + element.size / 2, 
                  element.y + element.size / 2
                );
                ctx.textAlign = 'left';
              }
              
            } else if (element.type === 'image') {
              // Renderizar imagen
              await new Promise<void>((imgResolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  ctx.save();
                  ctx.globalAlpha = element.opacity;
                  
                  // Aplicar rotación si es necesaria
                  if (element.rotation !== 0) {
                    const centerX = element.x + element.width / 2;
                    const centerY = element.y + element.height / 2;
                    ctx.translate(centerX, centerY);
                    ctx.rotate((element.rotation * Math.PI) / 180);
                    ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
                  } else {
                    ctx.drawImage(img, element.x, element.y, element.width, element.height);
                  }
                  
                  ctx.restore();
                  imgResolve();
                };
                img.onerror = () => {
                  console.warn(`No se pudo cargar la imagen para el elemento ${element.id}`);
                  imgResolve();
                };
                img.src = element.src;
              });
            }
          } catch (elementError) {
            console.warn(`Error renderizando elemento ${element.id}:`, elementError);
          }
        }
      };

      // Ejecutar el renderizado
      loadBackgroundImage()
        .then(() => renderElements())
        .then(() => {
          // Convertir canvas a blob y descargar
          canvas.toBlob((blob) => {
            if (blob) {
              const filename = generateFileName(
                'ticket', 
                index, 
                data, 
                useFilenameTemplate ? filenameTemplate : undefined
              ) + '.png';
              downloadFile(blob, filename, 'image/png');
              resolve();
            } else {
              reject(new Error('No se pudo crear el blob de la imagen'));
            }
          }, 'image/png', 0.9);
        })
        .catch(reject);
    });
  };

  return (
    <div className="batch-processor-overlay">
      <div className="batch-processor-modal">
        <div className="batch-processor-header">
          <h2>🚀 Procesamiento en Lote</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="batch-processor-content">
          {/* Información sobre variables */}
          {variables.length > 0 && (
            <div className="variables-info">
              <h3>📝 Variables encontradas en el template:</h3>
              <div className="variables-list">
                {variables.map(variable => (
                  <span key={variable.name} className="variable-tag">
                    {`{{${variable.name}}}`}
                  </span>
                ))}
              </div>
              <p className="variables-help">
                Asegúrate de que tu CSV tenga columnas con estos nombres exactos (más una columna "done").
              </p>
            </div>
          )}

          {/* Configuración de nombre de archivo */}
          <div className="filename-template-section">
            <h3>🏷️ Nombre de archivos</h3>
            <div className="filename-options">
              <label className="filename-option">
                <input
                  type="radio"
                  name="filenameMode"
                  checked={!useFilenameTemplate}
                  onChange={() => setUseFilenameTemplate(false)}
                />
                <span>Usar nombre automático (ticket-Nombre-timestamp)</span>
              </label>
              <label className="filename-option">
                <input
                  type="radio"
                  name="filenameMode"
                  checked={useFilenameTemplate}
                  onChange={() => setUseFilenameTemplate(true)}
                />
                <span>Usar template personalizado</span>
              </label>
            </div>
            
            {useFilenameTemplate && (
              <div className="filename-template-config">
                <div className="template-input-section">
                  <label htmlFor="filename-template">Template del nombre:</label>
                  <input
                    type="text"
                    id="filename-template"
                    value={filenameTemplate}
                    onChange={(e) => setFilenameTemplate(e.target.value)}
                    placeholder="Ejemplo: ticket-{{Nombre}}-{{Codigo}}"
                    className="filename-template-input"
                  />
                </div>
                <div className="template-help">
                  <p>💡 Usa variables del CSV entre llaves dobles: {'{{'} variable {'}'}</p>
                  <p>📋 Variables disponibles: {variables.map(v => `{{${v.name}}}`).join(', ')}</p>
                  {filenameTemplate && (
                    <p className="template-preview">
                      🔍 Vista previa: <code>{filenameTemplate.replace(/\{\{([^}]+)\}\}/g, '$1')}</code>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upload CSV */}
          <div className="csv-upload-section">
            <h3>📄 Cargar archivo CSV</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              id="csv-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="csv-upload" className="csv-upload-button">
              📁 Seleccionar CSV
            </label>
            
            {csvData.length > 0 && (
              <div className="csv-info">
                <p>✅ CSV cargado: {csvData.length} filas</p>
                <p>🔄 Pendientes: {csvData.filter(row => !row.done).length}</p>
                <p>✅ Completadas: {csvData.filter(row => row.done).length}</p>
              </div>
            )}
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div className="errors-section">
              <h3>❌ Errores encontrados:</h3>
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="progress-section">
              <h3>⏳ Procesando...</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p>{progress.current} de {progress.total}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="batch-actions">
            <button
              onClick={processBatch}
              disabled={csvData.length === 0 || isProcessing}
              className="process-button"
            >
              {isProcessing ? '⏳ Procesando...' : '🚀 Procesar Lote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessor;
