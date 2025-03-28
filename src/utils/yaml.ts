import { load } from 'js-yaml';
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';

/**
 * Loads and parses a YAML file
 * @param filePath - Path to the YAML file
 */
export async function loadYamlFile(filePath: string): Promise<any> {
  try {
    const fileContents = await readFile(filePath, 'utf8');
    return load(fileContents);
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Interpolates variables into a template string using Handlebars
 * @param template - The template string
 * @param variables - Object containing variables to interpolate
 */
export function interpolateTemplate(template: string, variables: Record<string, any>): string {
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(variables);
} 