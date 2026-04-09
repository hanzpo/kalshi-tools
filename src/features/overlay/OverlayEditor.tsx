import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OverlayConfig, OverlayElement } from './types';
import { createElement, generateId, scaleElements } from './overlayState';
import { getAllElementDefs, getElementDef } from './elements';
import { PRESETS } from './presets';
import { oe } from './styles';
import { SceneUrlsContext } from './UrlComboBox';

const RESOLUTION_PRESETS = [
  { label: '1080p', w: 1920, h: 1080 },
  { label: '1440p', w: 2560, h: 1440 },
  { label: '4K', w: 3840, h: 2160 },
  { label: '720p', w: 1280, h: 720 },
  { label: 'Vertical', w: 1080, h: 1920 },
  { label: 'Square', w: 1080, h: 1080 },
];

interface OverlayEditorProps {
  config: OverlayConfig;
  selectedId: string | null;
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  guidesEnabled: boolean;
  onConfigChange: (config: OverlayConfig) => void;
  onSelect: (id: string | null) => void;
  onCopyLink: () => void;
  onGuidesToggle: () => void;
}

export function OverlayEditor({
  config,
  selectedId,
  wsStatus,
  guidesEnabled,
  onConfigChange,
  onSelect,
  onCopyLink,
  onGuidesToggle,
}: OverlayEditorProps) {
  const [dragLayerId, setDragLayerId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
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
    const el = config.elements.find(e => e.id === id);
    if (el?.locked) return;
    updateElements(els => els.filter(el => el.id !== id));
    if (selectedId === id) onSelect(null);
  }, [config.elements, updateElements, selectedId, onSelect]);

  const duplicateElement = useCallback((id: string) => {
    const el = config.elements.find(e => e.id === id);
    if (!el) return;
    const cloned: OverlayElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: generateId(),
      x: el.x + 20,
      y: el.y + 20,
      locked: false,
    };
    updateElements(els => [...els, cloned]);
    onSelect(cloned.id);
  }, [config.elements, updateElements, onSelect]);

  const toggleLock = useCallback((id: string) => {
    updateElements(els => els.map(el =>
      el.id === id ? { ...el, locked: !el.locked } : el
    ));
  }, [updateElements]);

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
    // Scale elements from preset's native resolution to the current canvas size
    cloned.elements = scaleElements(
      cloned.elements,
      cloned.width,
      cloned.height,
      config.width,
      config.height,
    ).map(el => ({ ...el, id: generateId() }));
    cloned.width = config.width;
    cloned.height = config.height;
    onConfigChange(cloned);
    onSelect(null);
  }, [onConfigChange, onSelect, config.width, config.height]);

  const snapElement = useCallback((position: string) => {
    if (!selectedElement) return;
    const el = selectedElement;
    let x = el.x;
    let y = el.y;

    switch (position) {
      case 'tl': x = 0; y = 0; break;
      case 'tc': x = Math.round((config.width - el.width) / 2); y = 0; break;
      case 'tr': x = config.width - el.width; y = 0; break;
      case 'ml': x = 0; y = Math.round((config.height - el.height) / 2); break;
      case 'mc': x = Math.round((config.width - el.width) / 2); y = Math.round((config.height - el.height) / 2); break;
      case 'mr': x = config.width - el.width; y = Math.round((config.height - el.height) / 2); break;
      case 'bl': x = 0; y = config.height - el.height; break;
      case 'bc': x = Math.round((config.width - el.width) / 2); y = config.height - el.height; break;
      case 'br': x = config.width - el.width; y = config.height - el.height; break;
    }

    updateElements(els => els.map(e =>
      e.id === el.id ? { ...e, x, y } : e
    ));
  }, [selectedElement, config.width, config.height, updateElements]);

  const allDefs = getAllElementDefs();

  const sceneUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const el of config.elements) {
      const url = (el.props as Record<string, unknown>).marketUrl as string | undefined;
      if (url) urls.add(url);
    }
    return Array.from(urls);
  }, [config.elements]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className={oe.section}>
        <Link to="/" className="mb-2 inline-block text-[13px] text-text-muted no-underline transition-colors duration-150 hover:text-brand">&larr; Home</Link>
        <h2 className="text-lg font-semibold tracking-tight text-gray-100">Overlay Editor</h2>
        <p className="mt-1 text-[13px] text-text-muted">Build live overlays for OBS</p>
      </div>

      {/* Copy Link + Setup Guide */}
      <div className={oe.section}>
        <button className={oe.btnPrimary} onClick={onCopyLink}>
          Copy OBS Link
        </button>
        <button
          className="mt-2 w-full cursor-pointer rounded-md border border-dark-border-light bg-transparent px-3 py-1.5 text-xs text-text-secondary transition-colors duration-150 hover:border-brand hover:text-brand"
          onClick={() => setShowSetupGuide(v => !v)}
        >
          {showSetupGuide ? 'Hide' : 'Show'} OBS Setup Guide
        </button>
        {showSetupGuide && (
          <div className="mt-3 rounded-lg border border-dark-border bg-dark-elevated p-3 text-xs leading-relaxed text-text-secondary">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-primary">Adding to OBS</p>
            <ol className="flex list-inside list-decimal flex-col gap-1.5">
              <li>Click <strong className="text-brand">Copy OBS Link</strong> above</li>
              <li>In OBS, add a new <strong className="text-text-primary">Browser Source</strong></li>
              <li>Paste the link as the URL</li>
              <li>Set width to <strong className="text-text-primary">{config.width}</strong> and height to <strong className="text-text-primary">{config.height}</strong></li>
              <li>Check <strong className="text-text-primary">"Shutdown source when not visible"</strong> to save resources</li>
              <li>For transparent backgrounds, no extra config needed — OBS handles it automatically</li>
            </ol>
            <div className="mt-3 border-t border-dark-border pt-2">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-primary">Tips</p>
              <ul className="flex list-inside list-disc flex-col gap-1">
                <li>Use transparent background to layer over your game/camera</li>
                <li>Market data updates automatically — no need to refresh</li>
                <li>To update the overlay, just copy a new link and replace the URL</li>
                <li>Works with Streamlabs, XSplit, and any browser-source tool</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Live Data Status */}
      <div className={oe.section}>
        <div className="flex items-center justify-between">
          <label className={`${oe.label} !mb-0`}>Live Data</label>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: wsStatus === 'connected' ? '#00DD9422' : wsStatus === 'connecting' ? '#F59E0B22' : '#1C1E23',
            color: wsStatus === 'connected' ? '#00DD94' : wsStatus === 'connecting' ? '#F59E0B' : '#6b7280',
          }}>
            {wsStatus === 'connected' ? 'WebSocket' : wsStatus === 'connecting' ? 'Connecting...' : wsStatus === 'error' ? 'No API Key' : 'Polling (3s)'}
          </span>
        </div>
        <span className="mt-1 block text-[11px] text-text-muted">
          {wsStatus === 'connected'
            ? 'Real-time trades & prices via WebSocket'
            : 'Set KALSHI_API_KEY_ID & KALSHI_PRIVATE_KEY env vars for WebSocket'}
        </span>
      </div>

      {/* Presets */}
      <div className={oe.section}>
        <label className={oe.label}>Presets</label>
        <div className={oe.presetGrid}>
          {PRESETS.map(preset => (
            <button key={preset.id} className={oe.presetBtn} onClick={() => loadPreset(preset.id)} title={preset.description}>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Settings */}
      <div className={oe.section}>
        <label className={oe.label}>Canvas</label>
        <div className="mb-2 flex flex-wrap gap-1">
          {RESOLUTION_PRESETS.map(r => (
            <button
              key={r.label}
              className={`cursor-pointer rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-150 ${
                config.width === r.w && config.height === r.h
                  ? 'border-brand bg-brand/15 text-brand'
                  : 'border-dark-border-light bg-dark-elevated text-text-secondary hover:border-brand hover:text-brand'
              }`}
              onClick={() => {
                if (config.width === r.w && config.height === r.h) return;
                onConfigChange({
                  ...config,
                  width: r.w,
                  height: r.h,
                  elements: scaleElements(config.elements, config.width, config.height, r.w, r.h),
                });
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className={oe.row}>
          <div className={oe.field}>
            <span className={oe.fieldLabel}>W</span>
            <input type="number" className={oe.inputSm} value={config.width} onChange={e => onConfigChange({ ...config, width: parseInt(e.target.value) || 1920 })} />
          </div>
          <div className={oe.field}>
            <span className={oe.fieldLabel}>H</span>
            <input type="number" className={oe.inputSm} value={config.height} onChange={e => onConfigChange({ ...config, height: parseInt(e.target.value) || 1080 })} />
          </div>
        </div>
        <div className={`${oe.row} mt-2`}>
          <select className={oe.select} value={config.background.type} onChange={e => {
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
            <input type="color" className={oe.color} value={config.background.color || '#000000'} onChange={e => onConfigChange({ ...config, background: { type: 'solid', color: e.target.value } })} />
          )}
          {config.background.type === 'gradient' && (
            <input type="text" className={oe.input} placeholder="CSS gradient" value={config.background.gradient || ''} onChange={e => onConfigChange({ ...config, background: { type: 'gradient', gradient: e.target.value } })} />
          )}
        </div>
        <label className={oe.checkbox} style={{ marginTop: 8 }}>
          <input type="checkbox" checked={guidesEnabled} onChange={onGuidesToggle} />
          Snap guides
        </label>
      </div>

      {/* Add Elements */}
      <div className={oe.section}>
        <label className={oe.label}>Add Element</label>
        <div className={oe.addGrid}>
          {allDefs.map(def => (
            <button key={def.type} className={oe.addBtn} onClick={() => addElement(def.type)}>
              {def.icon}
              {def.label}
            </button>
          ))}
        </div>
      </div>

      {/* Element List */}
      <div className={oe.section}>
        <label className={oe.label}>Layers</label>
        <div className={oe.layerList}>
          {[...config.elements].sort((a, b) => b.zIndex - a.zIndex).map(el => {
            const def = getElementDef(el.type);
            return (
              <div
                key={el.id}
                className={`${oe.layerItem} ${selectedId === el.id ? oe.layerItemSelected : ''} ${dragOverId === el.id ? oe.layerItemDragover : ''} ${dragLayerId === el.id ? oe.layerItemDragging : ''}`}
                draggable={!el.locked}
                onDragStart={(e) => { if (el.locked) { e.preventDefault(); return; } setDragLayerId(el.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(el.id); }}
                onDragLeave={() => { if (dragOverId === el.id) setDragOverId(null); }}
                onDrop={(e) => { e.preventDefault(); handleLayerDrop(el.id); }}
                onDragEnd={() => { setDragLayerId(null); setDragOverId(null); }}
                onClick={() => onSelect(el.id)}
              >
                <span className={oe.layerGrip} title="Drag to reorder" style={el.locked ? { opacity: 0.3 } : undefined}>&#8942;&#8942;</span>
                <span className={oe.layerType}>{def?.label || el.type}</span>
                <span className={oe.layerDetail}>{def?.layerLabel(el.props) || ''}</span>
                <div className={oe.layerActions}>
                  <button
                    className={oe.layerBtn}
                    onClick={(e) => { e.stopPropagation(); toggleLock(el.id); }}
                    title={el.locked ? 'Unlock' : 'Lock'}
                    style={el.locked ? { color: '#F59E0B' } : undefined}
                  >
                    {el.locked ? (
                      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                    )}
                  </button>
                  <button
                    className={oe.layerBtn}
                    onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                    title="Duplicate"
                  >
                    &#x2398;
                  </button>
                  <button
                    className={oe.layerBtnDelete}
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                    title="Delete"
                    style={el.locked ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
                  >
                    &#10005;
                  </button>
                </div>
              </div>
            );
          })}
          {config.elements.length === 0 && (
            <div className={oe.empty}>No elements yet. Add one above or load a preset.</div>
          )}
        </div>
      </div>

      {/* Property Inspector */}
      {selectedElement && selectedDef && (
        <div className={oe.section}>
          <label className={oe.label}>Properties — {selectedDef.label}</label>

          {/* Snap to Position */}
          <div className="mb-3">
            <span className={oe.fieldLabel}>Snap to Position</span>
            <div className="mt-1 inline-grid grid-cols-3 gap-px overflow-hidden rounded-md border border-dark-border-light">
              {(['tl','tc','tr','ml','mc','mr','bl','bc','br'] as const).map(pos => (
                <button
                  key={pos}
                  className="flex size-7 cursor-pointer items-center justify-center bg-dark-elevated text-[10px] text-text-muted transition-colors hover:bg-dark-border-light hover:text-brand"
                  onClick={() => snapElement(pos)}
                  title={
                    { tl: 'Top Left', tc: 'Top Center', tr: 'Top Right', ml: 'Middle Left', mc: 'Center', mr: 'Middle Right', bl: 'Bottom Left', bc: 'Bottom Center', br: 'Bottom Right' }[pos]
                  }
                >
                  {
                    { tl: '\u2196', tc: '\u2191', tr: '\u2197', ml: '\u2190', mc: '\u2022', mr: '\u2192', bl: '\u2199', bc: '\u2193', br: '\u2198' }[pos]
                  }
                </button>
              ))}
            </div>
          </div>

          <div className={oe.row}>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>X</span>
              <input type="number" className={oe.inputSm} value={selectedElement.x}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, x: parseInt(e.target.value) || 0 } : el))} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>Y</span>
              <input type="number" className={oe.inputSm} value={selectedElement.y}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, y: parseInt(e.target.value) || 0 } : el))} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>W</span>
              <input type="number" className={oe.inputSm} value={selectedElement.width}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, width: parseInt(e.target.value) || 40 } : el))} />
            </div>
            <div className={oe.field}>
              <span className={oe.fieldLabel}>H</span>
              <input type="number" className={oe.inputSm} value={selectedElement.height}
                onChange={e => updateElements(els => els.map(el => el.id === selectedElement.id ? { ...el, height: parseInt(e.target.value) || 20 } : el))} />
            </div>
          </div>
          <SceneUrlsContext.Provider value={sceneUrls}>
            <selectedDef.PropsEditor
              props={selectedElement.props}
              onChange={(newProps) => {
                updateElements(els => els.map(el =>
                  el.id === selectedElement.id ? { ...el, props: newProps } : el
                ));
              }}
            />
          </SceneUrlsContext.Provider>
        </div>
      )}
    </div>
  );
}
