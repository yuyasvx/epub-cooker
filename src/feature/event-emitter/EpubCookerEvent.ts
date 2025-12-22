import type { EpubCookerEventCode } from './enums/EpubCookerEventCode';
import type { EpubCookerEventPayload } from './EpubCookerEventPayload';
import { _getEventEmitter } from './InitEvent';

export const epubCookerEvent = {
  on<EC extends EpubCookerEventCode>(eventCode: EC, handler: (payload: EpubCookerEventPayload[EC]) => void) {
    _getEventEmitter().on(eventCode, handler);
  },
  offAll() {
    _getEventEmitter().all.clear();
  },
};
