/* eslint-disable @typescript-eslint/no-unused-vars */

import { lazy } from 'gunshi';
import { rejecting } from '../../lib/util/EffectUtil';
import type { ResolvedPath } from '../../value/ResolvedPath';
import { cook } from './CookCommandRunner';

/**
 * @internal
 */
export const cookCommandConfig = lazy(
  async () => async (ctx) => {
    const { debug, dir, info, output } = ctx.values;
    const noPack = ctx.values['no-pack'] as boolean;

    try {
      await rejecting(cook((dir ?? process.cwd()) as ResolvedPath, noPack));
    } catch (e) {
      console.error(e);
    }
  },
  {
    name: 'cook',
    // description: 'Example of a lazy command with an async runner',
    args: {
      dir: { type: 'string', short: 'd' },
      debug: { type: 'boolean', default: false },
      output: { type: 'string', short: 'o' },
      'no-pack': { type: 'boolean', default: false },
      info: { type: 'boolean', default: false },
    },
  },
);
