/** Shared Tailwind class strings for control panel form elements */
export const ctrl = {
  /** Main control panel wrapper */
  panel: 'sticky top-6 h-fit rounded-lg border border-dark-border bg-dark-surface p-6 text-text-primary shadow-sm shadow-black/30 max-lg:static max-lg:mb-4 max-lg:p-5 max-md:p-4',
  /** Back button at top */
  backBtn: 'mb-4 inline-flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-0 py-1 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:text-gray-300',
  /** Panel title */
  title: 'mb-1 text-[22px] font-semibold tracking-tight text-gray-100 max-md:text-xl max-[480px]:text-lg',
  /** Panel subtitle */
  subtitle: 'mb-5 text-[13px] leading-relaxed text-text-secondary max-md:mb-4 max-md:text-xs',
  /** Grouped section with background */
  section: 'mb-4 rounded-lg border border-dark-border bg-dark-elevated p-3.5 [&_.control-group]:mb-3.5 [&_.control-group:last-child]:mb-0',
  /** Section title */
  sectionTitle: 'mb-3 border-b border-dark-border-light pb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary',
  /** Control group wrapper */
  group: 'mb-4 max-md:mb-3.5 [&>label]:mb-1.5 [&>label]:block [&>label]:text-[11px] [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.04em] [&>label]:text-brand',
  /** Text/select input */
  input: 'w-full rounded-[5px] border border-dark-border-light bg-dark px-2.5 py-2 text-sm text-text-primary transition-[border-color] duration-150 placeholder:text-[#555] hover:border-[#444] focus:border-brand focus:outline-none',
  /** File input */
  fileInput: 'w-full cursor-pointer rounded-[5px] border border-dark-border-light bg-dark p-2 text-[13px] text-text-primary',
  /** Help text below inputs */
  helpText: 'mt-1 text-[11px] leading-relaxed text-text-muted',
  /** Slider labels row */
  sliderLabels: 'mt-0.5 flex justify-between text-[11px] text-text-secondary',
  /** Slider value display */
  sliderValue: 'text-right text-[13px] font-medium text-gray-300',
  /** Slider wrapper */
  sliderWrapper: 'flex flex-col gap-1.5',
  /** Color toggle row */
  colorToggle: 'flex gap-1.5 max-[480px]:flex-col',
  /** Color option button */
  colorOption: 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-dark-border-light bg-dark-surface px-2.5 py-2 text-[13px] font-medium text-text-secondary transition-[border-color,background-color,color] duration-150 hover:border-[#444]',
  /** Segmented control wrapper */
  segmented: 'flex gap-0.5 rounded-[5px] bg-dark-elevated p-0.5',
  /** Segmented option */
  segmentedOption: 'flex-1 cursor-pointer rounded border-none bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-text-secondary transition-[background-color,color] duration-150 hover:text-gray-300',
  /** Active segmented option */
  segmentedOptionActive: 'bg-dark-surface text-brand shadow-sm shadow-black/20',
  /** Regenerate button */
  btnRegen: 'mb-1.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-dark-border-light bg-dark-elevated px-2.5 py-2.5 text-[13px] font-medium text-text-secondary transition-[background-color] duration-150 hover:bg-dark-border-light hover:text-gray-300',
  /** Export button */
  btnExport: 'mb-1.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border-none bg-brand px-2.5 py-2.5 text-[13px] font-medium text-white transition-[background-color] duration-150 hover:bg-[#07a972]',
  /** Draw button */
  btnDraw: 'mb-1.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border-none bg-[#3b82f6] px-2.5 py-2.5 text-[13px] font-medium text-white transition-[background-color] duration-150 hover:bg-[#2563eb]',
  /** Checkbox group wrapper (label + helpText) — no auto-styling on label */
  checkboxGroup: 'mb-3 [&>p]:mt-1',
  /** Checkbox label */
  checkboxLabel: 'flex cursor-pointer items-center gap-2 text-[13px] font-medium text-text-primary',
  /** Checkbox input */
  checkboxInput: 'size-4 shrink-0 cursor-pointer accent-brand',
  /** Color input swatch */
  colorInput: 'size-8 cursor-pointer rounded border border-dark-border-light bg-none p-0',
  /** Combo legs container */
  comboLegs: 'flex flex-col gap-2.5',
  /** Single combo leg card */
  comboLeg: 'rounded-[5px] border border-dark-border-light bg-dark-elevated p-3',
  /** Combo leg header row */
  comboLegHeader: 'mb-2.5 flex items-center justify-between',
  /** Combo leg title */
  comboLegTitle: 'text-xs font-semibold text-gray-300',
  /** Combo leg remove button */
  comboLegRemove: 'cursor-pointer rounded-[3px] border-none bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-[#dc2626] transition-[background-color] duration-150 hover:bg-[#3d1c1c] disabled:cursor-not-allowed disabled:opacity-40',
  /** Combo leg body */
  comboLegBody: 'flex flex-col gap-2.5',
  /** Combo leg label */
  comboLegLabel: 'text-[10px] font-semibold uppercase tracking-[0.04em] text-text-secondary',
  /** Combo leg controls row */
  comboLegControls: 'flex flex-wrap gap-2.5',
  /** Single control in a combo leg */
  comboLegControl: 'flex min-w-[140px] flex-1 flex-col gap-1',
  /** Add combo leg button */
  comboLegAdd: 'w-full cursor-pointer rounded-[5px] border-[1.5px] border-dashed border-[#444] bg-transparent p-2 text-xs font-medium text-text-muted transition-[border-color,color] duration-150 hover:border-brand hover:text-brand',
  /** Combo image upload row */
  comboImageUpload: 'flex items-center gap-1.5',
  /** Combo leg image thumbnail */
  comboLegImage: 'size-9 rounded-[5px] border border-dark-border-light object-cover',
  /** Clear image button */
  comboImageClear: 'cursor-pointer rounded border border-[#5c2020] bg-transparent px-2 py-1 text-[11px] font-medium text-[#dc2626] transition-[background-color] duration-150 hover:bg-[#3d1c1c]',
  /** Image placeholder button */
  comboImagePlaceholder: 'inline-flex cursor-pointer items-center justify-center rounded border-[1.5px] border-dashed border-[#444] px-3 py-1.5 text-[11px] font-medium text-text-muted transition-[border-color,color] duration-150 hover:border-brand hover:text-brand',
} as const;
