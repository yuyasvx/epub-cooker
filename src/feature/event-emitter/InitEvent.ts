import type { Emitter } from 'mitt';
import type { EpubCookerEventPayload } from './EpubCookerEventPayload';

let emitter: Emitter<EpubCookerEventPayload>;

/**
 * @internal
 */
export function _initEventEmitter(e: Emitter<EpubCookerEventPayload>) {
  emitter = e;
}

/**
 * @internal
 */
export function _getEventEmitter() {
  return emitter;
}
