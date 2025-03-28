import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import path from 'path';
import { Warriors } from '../data/warriors';

interface PromptTemplate {
  template: string;
  [key: string]: any;
}

export function loadPromptTemplate(templatePath: string): PromptTemplate {
  try {
    const filePath = path.resolve(process.cwd(), templatePath);
    const fileContents = readFileSync(filePath, 'utf8');
    return load(fileContents) as PromptTemplate;
  } catch (error) {
    console.error(`Error loading prompt template ${templatePath}:`, error);
    throw error;
  }
}

export function createWarriorSystemPrompt(warrior: Warrior, context: string = ""): string {
  // Load base template
  const baseTemplate = loadPromptTemplate('src/prompts/warriors/base.yaml');
  
  // Try to load warrior-specific customizations
  let customizations = {};
  try {
    customizations = loadPromptTemplate(`src/prompts/warriors/specific/${warrior.id}.yaml`);
  } catch {
    // No specific customizations for this warrior, that's fine
  }
  
  // Merge and interpolate
  const merged = { ...baseTemplate, ...customizations, ...warrior, context };
  let result = baseTemplate.template;
  
  // Replace all variables
  for (const [key, value] of Object.entries(merged)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  
  return result;
} 