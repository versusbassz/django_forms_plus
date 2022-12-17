/**
 * The entry point for development (in pair with the dev Django backend)
 */

import React from "react";
import { DevTool } from '@hookform/devtools'

import { dfp_init_forms } from './parts'

console.log('[DFP] DEV BUILD');

dfp_init_forms((control) => <DevTool control={control} />)
