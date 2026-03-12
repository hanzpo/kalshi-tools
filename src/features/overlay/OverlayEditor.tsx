import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { OverlayConfig, OverlayElement } from './types';
import { createElement, generateId } from './overlayState';
import { getAllElementDefs, getElementDef } from './elements';
import { PRESETS } from './presets';

interface OverlayEditorProps {
  config: OverlayConfig;
  selectedId: string | null;
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  onConfigChange: (config: OverlayConfig) => void;
  onSelect: (id: string | null) => void;
  onCopyLink: () => void;
}

export function OverlayEditor({
  config,
  selectedId,
  wsStatus,
  onConfigChange,
  onSelect,
  onCopyLink,
}: OverlayEditorProps) {
  const [dragLayerId, setDragLayerId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const selectedElement = config.elements.find(el => el.id === selectedId) || null;
  const selectedDef = selectedElement ? getElementDef(selectedElement.type) : null;

  const updateElements = useCallback((updater: (els: OverlayElement[]) => OverlayElement[]) => {
    onConfigChange({ ...config, elements: updater(config.elements) });
  }, [config, onConfigChange]);

  const addElement = useCallback((type: string) => {
    const el = createElement(type);
    if (!el) return;
    updateElements(els => [...els, el]);
    onSelect(el.id);
  }, [updateElements, onSelect]);

  const deleteElement = useCallback((id: string) => {
    updateElements(els => els.filter(el => el.id !== id));
    if (selectedId === id) onSelect(null);
  }, [updateElements, selectedId, onSelect]);

  const handleLayerDrop = useCallback((targetId: string) => {
    if (!dragLayerId || dragLayerId === targetId) {
      setDragLayerId(null);
      setDragOverId(null);
      return;
    }
    const sorted = [...config.elements].sort((a, b) => b.zIndex - a.zIndex);
    const dragIdx = sorted.findIndex(el => el.id === dragLayerId);
    const targetIdx = sorted.findIndex(el => el.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const [dragged] = sorted.splice(dragIdx, 1);
    sorted.splice(targetIdx, 0, dragged);

    const maxZ = sorted.length - 1;
    const idToZ: Record<string, number> = {};
    sorted.forEach((el, i) => { idToZ[el.id] = maxZ - i; });

    updateElements(els => els.map(el => ({ ...el, zIndex: idToZ[el.id] ?? el.zIndex })));
    setDragLayerId(null);
    setDragOverId(null);
  }, [dragLayerId, config.elements, updateElements]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const cloned: OverlayConfig = JSON.parse(JSON.stringify(preset.config));
    cloned.elements = cloned.elements.map(el => ({ ...el, id: generateId() }));
    onConfigChange(cloned);
    onSelect(null);
  }, [onConfigChange, onSelect]);

  const allDefs = getAllElementDefs();

  return (
    <div className="overlay-editor">
      {/* Header */}
      <div className="oe-section">
        <Link to="/" className="oe-back">&larr; Home</Link>
        <h2 className="oe-title">Overlay Editor</h2>
        <p className="oe-subtitle">Build live overlays for OBS</p>
      </div>

      {/* Copy Link */}
      <div className="oe-section">
        <button className="oe-btn oe-btn--primary" onClick={onCopyLink}>
          Copy OBS Link
        </button>
      </div>

      {/* Live Data Status */}
      <div className="oe-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="oe-label" style={{ margin: 0 }}>Live Data</label>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: wsStatus === 'connected' ? '#09C28522' : wsStatus === 'connecting' ? '#F59E0B22' : '#333',
            color: wsStatus === 'connected' ? '#09C285' : wsStatus === 'connecting' ? '#F59E0B' : '#6b7280',
          }}>
            {wsStatus === 'connected' ? 'WebSocket' : wsStatus === 'connecting' ? 'Connecting...' : wsStatus === 'error' ? 'No API Key' : 'Polling (3s)'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>
          {wsStatus === 'connected'
            ? 'Real-time trades & prices via WebSocket'
            : 'Set KALSHI_API_KEY_ID & KALSHI_PRIVATE_KEY env vars for WebSocket'}
        </span>
      </div>

      {/* Presets */}
      <div className="oe-section">
        <label className="oe-label">Presets</label>
        <div className="oe-preset-grid">
          {PRESETS.map(preset => (
            <button key={preset.id} className="oe-preset-btn" onClick={() => loadPreset(preset.id)} title={preset.description}>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Settings */}
      <div className="oe-section">
        <label className="oe-label">Canvas</label>
        <div className="oe-row">
          <div className="oe-field">
            <span className="oe-field-label">W</span>
            <input type="number" className="oe-input oe-input--sm" value={config.width} onChange={e => onConfigChange({ ...config, width: parseInt(e.target.value) || 1920 })} />
          </div>
          <div className="oe-field">
            <span className="oe-field-label">H</span>
            <input type="number" className="oe-input oe-input--sm" value={config.height} onChange={e => onConfigChange({ ...config, height: parseInt(e.target.value) || 1080 })} />
          </div>
        </div>
        <div className="oe-row" style={{ marginTop: 8 }}>
          <select className="oe-select" value={config.background.type} onChange={e => {
            const type = e.target.value as 'solid' | 'gradient' | 'transparent';
            onConfigChange({
              ...config,
              background: type === 'transparent' ? { type: 'transparent' }
                : type === 'gradient' ? { type: 'gradient', gradient: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' }
                : { type: 'solid', color: '#000000' },
            });
          }}>
            <option value="transparent">Transparent</option>
            <option value="solid">Solid Color</option>
            <option value="gradient">Gradient</option>
          </select>
          {config.background.type === 'solid' && (
            <input type="color" className="oe-color" value={config.background.color || '#000000'} onChange={e => onConfigChange({ ...config, background: { type: 'solid', color: e.target.value } })} />
          )}
          {config.background.type === 'gradient' && (
            <input type="text" className="oe-input" placeholder="CSS gradient" value={config.background.gradient || ''} onChange={e => onConfigChange({ ...config, background: { type: 'gradient', gradient: e.target.value } })} />
          )}
        </div>
      </div>

      {/* Add Elements — auto-generated from registry */}
      <div className="oe-section">
        <label className="oe-label">Add Element</label>
        <div className="oe-add-grid">
          {allDefs.map(def => (
            <button key={def.type} className="oe-add-btn" onClick={() => addElement(def.type)}>
              {def.icon}
              {def.label}
            </button>
          ))}
        </div>
      </div>

      {/* Element List */}
      <div className="oe-section">
        <label className="oe-label">Layers</label>
        <div className="oe-layer-list">
          {[...config.elements].sort((a, b) => b.zIndex - a.zIndex).map(el => {
            const def = getElementDef(el.type);
            return (
              <div
                key={el.id}
                className={`oe-layer-item ${selectedId === el.id ? 'oe-layer-item--selected' : ''} ${dragOverId === el.id ? 'oe-layer-item--dragover' : ''} ${dragLayerId === el.id ? 'oe-layer-item--dragging' : ''}`}
                draggable
                onDragStart={(e) => { setDragLayerId(el.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(el.id); }}
                onDragLeave={() => { if (dragOverId === el.id) setDragOverId(null); }}
                onDrop={(e) => { e.preventDefault(); handleLayerDrop(el.id); }}
                onDragEnd={() => { setDragLayerId(null); setDragOverId(null); }}
                onClick={() => onSelect(el.id)}
              >
                <span className="oe-layer-grip" title="Drag to reorder">&#8942;&#8942;</span>
                <span className="oe-layer-type">{def?.label || el.type}</span>
                <span className="oe-layer-detail">{def?.layerLabel(el.props) || ''}</span>
                <div className="oe-layer-actions">
                  <button className="oe-layer-btn oe-layer-btn--delete" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} title="Delete">&#10005;</button>
                </div>
              </div>
            );
          })}
          {config.elements.length === 0 && (
            <div className="oe-empty">No elements yet. Add one above or load a preset.</div>
          )}
        </div>
      </div>

      {/* Property Inspector — driven by registry */}
      {selectedElement && selectedDef && (
        <div className="oe-section">
          <label className="oe-label">Properties — {selectedDef.label}</label>

          {/* Position & Size (universal for all elements) */}
          <div className="oe-row">
            <div className="oe-field">
              <span className="oe-field-label">X</span>
              <input type="number" className="oe-input oe-input--sm" value={selectedElement.x}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, x: parseInt(e.target.value) || 0 } : el))} />
            </div>
            <div className="oe-field">
              <span className="oe-field-label">Y</span>
              <input type="number" className="oe-input oe-input--sm" value={selectedElement.y}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, y: parseInt(e.target.value) || 0 } : el))} />
            </div>
            <div className="oe-field">
              <span className="oe-field-label">W</span>
              <input type="number" className="oe-input oe-input--sm" value={selectedElement.width}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, width: parseInt(e.target.value) || 40 } : el))} />
            </div>
            <div className="oe-field">
              <span className="oe-field-label">H</span>
              <input type="number" className="oe-input oe-input--sm" value={selectedElement.height}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, height: parseInt(e.target.value) || 20 } : el))} />
            </div>
          </div>

          {/* Type-specific props editor from registry */}
          <selectedDef.PropsEditor
            props={selectedElement.props}
            onChange={(newProps) => {
              updateElements(els => els.map(el =>
                el.id === selectedElement.id ? { ...el, props: newProps } : el
              ));
            }}
          />
        </div>
      )}
    </div>
  );
}
