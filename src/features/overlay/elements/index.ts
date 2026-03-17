/**
 * Element registry barrel file.
 *
 * Import this file once (in OverlayBuilder) to register all element types.
 * To add a new element type, create a new file that calls registerElement(...)
 * and add an import here.
 */

// Core elements
import './MarketElement';
import './TextElement';
import './LogoElement';
import './ShapeElement';
import './ImageElement';

// Specialized elements
import './MatchupElement';
import './MatchupChartElement';
import './TradeFeedElement';
import './QrCodeElement';
import './DisclaimerElement';
import './NewsTickerElement';

export { getElementDef, getAllElementDefs, registerElement } from './registry';
export type { ElementDefinition } from './registry';
