import { ModelProvider } from './ai';

// Default model configuration
const DEFAULT_CONFIG = {
  provider: 'openai' as ModelProvider,
  model: 'gpt-4o-mini',
  isAdminMode: false,
};

// In-memory storage for application-wide model config
let activeConfig = { ...DEFAULT_CONFIG };

// Storage key for persistence
const STORAGE_KEY = 'rflkt_model_config';

// Initialize config from localStorage if available
export const initModelConfig = (): void => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      activeConfig = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      
      // Fix any outdated Gemma model names
      if (activeConfig.provider === 'gemma') {
        // Ensure Gemma model name is in the correct format
        if (!activeConfig.model.includes('it:free')) {
          activeConfig.model = 'google/gemma-3-27b-it:free';
          console.log('Fixed outdated Gemma model name in config');
          // Save the fixed config back to storage
          saveConfig();
        }
      }
    }
  } catch (error) {
    console.error('Failed to load model config from storage:', error);
  }
};

// Save current config to localStorage
const saveConfig = (): void => {
  try {
    // Fix any outdated Gemma model names before saving
    if (activeConfig.provider === 'gemma' && !activeConfig.model.includes('it:free')) {
      activeConfig.model = 'google/gemma-3-27b-it:free';
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
  } catch (error) {
    console.error('Failed to save model config to storage:', error);
  }
};

// Get current model config
export const getModelConfig = () => {
  // Fix any outdated Gemma model names before returning
  if (activeConfig.provider === 'gemma' && !activeConfig.model.includes('it:free')) {
    activeConfig.model = 'google/gemma-3-27b-it:free';
  }
  
  return { ...activeConfig };
};

// Set model provider
export const setModelProvider = (provider: ModelProvider): void => {
  activeConfig.provider = provider;
  
  // When switching to Gemma, ensure the correct model name format
  if (provider === 'gemma') {
    activeConfig.model = 'google/gemma-3-27b-it:free';
  } else if (provider === 'openai') {
    activeConfig.model = 'gpt-4o-mini';
  }
  
  saveConfig();
};

// Set specific model
export const setModel = (model: string): void => {
  activeConfig.model = model;
  saveConfig();
};

// Toggle admin mode
export const toggleAdminMode = (password: string): boolean => {
  // Simple password check - in a real app, use proper authentication
  if (password === 'rflkt-admin') {
    activeConfig.isAdminMode = !activeConfig.isAdminMode;
    saveConfig();
    return true;
  }
  return false;
};

// Check if admin mode is active
export const isAdminMode = (): boolean => {
  return activeConfig.isAdminMode;
};

// Initialize on module load
initModelConfig(); 