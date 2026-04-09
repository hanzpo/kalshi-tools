import { TradeSlipConfig, ComboLeg } from '../../types';
import { ctrl } from '../../styles/controls';
import type { useComboState } from './useComboState';

type ComboHandlers = ReturnType<typeof useComboState>;

interface ComboOldModeControlsProps {
  config: TradeSlipConfig;
  onConfigChange: (config: Partial<TradeSlipConfig>) => void;
  handlers: ComboHandlers;
}

export function ComboOldModeControls({ config, onConfigChange, handlers }: ComboOldModeControlsProps) {
  const {
    draggingLegId,
    handleLegChange,
    handleLegImageInput,
    handleAddLeg,
    handleRemoveLeg,
    handleLegDragOver,
    handleLegDragLeave,
    handleLegDrop,
  } = handlers;

  return (
    <>
      {/* Content Section */}
      <div className={ctrl.section}>
        <div className={ctrl.sectionTitle}>Content</div>
        <div className={ctrl.group}>
          <label htmlFor="bet-title-old">Slip Title</label>
          <input
            id="bet-title-old"
            type="text"
            className={ctrl.input}
            placeholder="e.g., Sunday Night Combo"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>
      </div>

      {/* Combo Legs Editor */}
      <div className={ctrl.group}>
        <label aria-hidden="true">Combo Legs</label>
        <div className={ctrl.comboLegs}>
          {config.comboLegs.map((leg, index) => (
            <div key={leg.id} className={ctrl.comboLeg}>
              <div className={ctrl.comboLegHeader}>
                <span className={ctrl.comboLegTitle}>Leg {index + 1}</span>
                <button
                  type="button"
                  className={ctrl.comboLegRemove}
                  onClick={() => handleRemoveLeg(leg.id)}
                  disabled={config.comboLegs.length <= 1}
                >
                  Remove
                </button>
              </div>
              <div className={ctrl.comboLegBody}>
                <label className={ctrl.comboLegLabel} htmlFor={`combo-question-${leg.id}`}>
                  Question
                </label>
                <input
                  id={`combo-question-${leg.id}`}
                  type="text"
                  className={ctrl.input}
                  placeholder="e.g., New York Giants to win?"
                  value={leg.question}
                  onChange={(e) => handleLegChange(leg.id, { question: e.target.value })}
                />
                <div className={ctrl.comboLegControls}>
                  <div className={ctrl.comboLegControl}>
                    <span className={ctrl.comboLegLabel}>Answer</span>
                    <div className={ctrl.colorToggle}>
                      {(['Yes', 'No'] as ComboLeg['answer'][]).map((answer) => {
                        const isActive = leg.answer === answer;
                        const color = answer === 'Yes' ? '#0f9b6c' : '#d91616';
                        return (
                          <button
                            key={answer}
                            type="button"
                            className={`${ctrl.colorOption} ${isActive ? 'font-semibold' : 'font-medium'}`}
                            style={isActive ? { borderColor: color, backgroundColor: `${color}20`, color } : { color }}
                            onClick={() => handleLegChange(leg.id, { answer })}
                            aria-pressed={isActive}
                          >
                            {answer}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className={ctrl.comboLegControl}>
                    <span className={ctrl.comboLegLabel}>Image</span>
                    <div
                      onDragOver={(e) => handleLegDragOver(leg.id, e)}
                      onDragLeave={handleLegDragLeave}
                      onDrop={(e) => handleLegDrop(leg.id, e)}
                      className={`${ctrl.comboImageUpload} rounded-lg border-[1.5px] border-dashed transition-[border-color] duration-200 ${draggingLegId === leg.id ? 'border-brand' : 'border-dark-border-light'}`}
                    >
                      {leg.image ? (
                        <>
                          <img src={leg.image} alt="" className={ctrl.comboLegImage} />
                          <button
                            type="button"
                            className={ctrl.comboImageClear}
                            onClick={() => handleLegChange(leg.id, { image: null })}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <label htmlFor={`combo-image-${leg.id}`} className={ctrl.comboImagePlaceholder}>
                            {draggingLegId === leg.id ? 'Drop image' : 'Upload or drop'}
                          </label>
                          <input
                            id={`combo-image-${leg.id}`}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => handleLegImageInput(leg.id, e)}
                            className={`${ctrl.fileInput} hidden`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className={ctrl.comboLegAdd} onClick={handleAddLeg}>
            + Add Leg
          </button>
        </div>
      </div>
    </>
  );
}
