/**
 * Clés localStorage centralisées pour tous les niveaux
 * Usage: import { getStorageKeys } from '@/shared/utils/storageKeys'
 *        const keys = getStorageKeys('6e')
 */

/**
 * Génère toutes les clés localStorage pour un niveau donné
 * @param {string} grade - Le niveau (6e, 5e, 3e)
 * @returns {Object} Objet contenant toutes les clés pour ce niveau
 */
export function getStorageKeys(grade) {
  const prefix = `maths${grade}`
  
  return {
    // Clés communes (utilisées par les hooks partagés)
    player: `${prefix}_player`,
    history: `${prefix}_history`,
    badges: `${prefix}_badges`,
    
    // Clés spécifiques aux modules 6e
    tableStrike: {
      scores: `${prefix}_ts_scores`,
      weak: `${prefix}_ts_weak`,
    },
    divisix: {
      scores: `${prefix}_dv_scores`,
    },
    chrono: {
      best: `${prefix}_chrono_best`,
    },
    operaMix: {
      best: `${prefix}_om_best`,
    },
    daily: `${prefix}_daily`,
    
    // Helper pour obtenir n'importe quelle clé custom
    custom: (key) => `${prefix}_${key}`,
  }
}

/**
 * Clés pour 6e (pour rétro-compatibilité directe)
 */
export const KEYS_6E = getStorageKeys('6e')

/**
 * Clés pour 5e
 */
export const KEYS_5E = getStorageKeys('5e')

/**
 * Clés pour 3e
 */
export const KEYS_3E = getStorageKeys('3e')

/**
 * Toutes les clés possibles (pour migration/debug)
 */
export const ALL_KEYS = {
  '6e': KEYS_6E,
  '5e': KEYS_5E,
  '3e': KEYS_3E,
}
