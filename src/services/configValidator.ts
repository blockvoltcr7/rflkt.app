/**
 * This service performs application-wide validation of model configurations
 * to ensure that no invalid model names are used.
 */

import { getModelConfig, setModelProvider, setModel } from './modelConfig';
import { MODEL_OPTIONS } from './ai';

// Validate current config
export const validateCurrentConfig = (): void => {
  console.log('Running model config validation...');
  
  const config = getModelConfig();
  console.log('Current config:', config);
  
  // Check if the provider is valid
  if (!['openai', 'gemma'].includes(config.provider)) {
    console.warn(`Invalid provider "${config.provider}", resetting to "openai"`);
    setModelProvider('openai');
    return;
  }
  
  // Check if the model exists for the provider
  const validModels = MODEL_OPTIONS[config.provider];
  if (!validModels.includes(config.model)) {
    console.warn(`Invalid model "${config.model}" for provider "${config.provider}", resetting to provider default`);
    
    // Set to first model in the list for the provider
    setModel(validModels[0]);
  }
  
  // Specifically check Gemma models to ensure they have the :free suffix
  if (config.provider === 'gemma' && !config.model.includes('it:free')) {
    console.warn(`Gemma model "${config.model}" is missing :free suffix, fixing...`);
    setModel('google/gemma-3-27b-it:free');
  }
  
  console.log('Config validation complete:', getModelConfig());
};

// Run validation on module load
validateCurrentConfig(); 