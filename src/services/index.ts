/**
 * Service layer barrel.
 *
 *   import { auth, data } from '@/services';
 *   await auth.sendPhoneOtp('+1555...');
 *   const packs = await data.getCoinPacks();
 */
export * as auth from './auth';
export * as data from './data';
export { isBackendEnabled, backendMode } from '../lib/config';
