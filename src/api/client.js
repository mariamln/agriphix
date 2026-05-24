import { buildEntitiesApi } from '@/api/firestore/entities';
import { firebaseAuthApi } from '@/api/firestore/auth';
import { firebaseIntegrations } from '@/api/firestore/integrations';

/**
 * @typedef {Object} InvokeLLMOptions
 * @property {string} prompt
 * @property {object} [response_json_schema]
 * @property {string[]} [file_urls]
 */

/** @type {typeof firebaseIntegrations} */
const integrations = firebaseIntegrations;

export const api = {
  entities: buildEntitiesApi(),
  auth: firebaseAuthApi,
  integrations,
  appLogs: {
    logUserInApp: async () => {},
  },
};
