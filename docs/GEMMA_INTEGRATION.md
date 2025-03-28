# Gemma 3 Integration for RFLKT

This document outlines how Gemma 3 has been integrated into the RFLKT application as an alternative model provider to OpenAI.

## Overview

RFLKT now supports both OpenAI and Gemma 3 models for the warrior chat feature. Users can switch between these providers in the chat interface.

## Setup

1. Create an account on OpenRouter: https://openrouter.ai/
2. Get your API key from the dashboard
3. Add your OpenRouter API key to the `.env` file:
   ```
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Architecture

The integration follows a provider pattern that allows easy addition of new model providers:

1. **AI Service Abstraction**: `src/services/ai.ts` provides a unified interface for all AI models
2. **Provider-specific Implementations**:
   - `src/services/openai.ts` - Original OpenAI implementation
   - `src/services/gemma.ts` - New Gemma implementation via OpenRouter

3. **Model Switching UI**: Administrators can select the model via the admin panel:
   - Provider (OpenAI or Gemma)
   - Specific model from the selected provider

## Available Models

- **OpenAI**: 
  - gpt-4o-mini
  - gpt-3.5-turbo
  - gpt-4o

- **Gemma**:
  - google/gemma-3-27b-it:free (free tier via OpenRouter)

## OpenRouter Integration

The Gemma integration uses the OpenAI SDK but configures it to use OpenRouter's API:

```javascript
const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'RFLKT Warrior Chat',
  },
  dangerouslyAllowBrowser: true
});
```

## Adding New Models

To add support for new models in the future:

1. Create a new service file (e.g., `src/services/newprovider.ts`)
2. Implement the `createChatCompletion` function matching the existing interface
3. Update `src/services/ai.ts` to include the new provider:
   - Add to the `ModelProvider` type
   - Add models to the `MODEL_OPTIONS` object
   - Add a default model to `DEFAULT_MODELS`
   - Update the provider selection logic in `createChatCompletion`

## Considerations

- Gemma 3 via OpenRouter has a daily limit of 200 requests on the free tier
- Response formats may vary slightly between providers
- The application validates API keys for both providers on startup
- If a model is not responding correctly, use the admin test panel to debug 