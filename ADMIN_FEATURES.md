# RFLKT Admin Features

This document outlines the admin features of the RFLKT application, including how to access the admin panel and manage AI model configurations.

## Model Configuration

RFLKT allows admins to select which AI model provider and specific model to use for all warrior chat interactions. This setting is global and affects all users.

### Accessing Admin Mode

There are several ways to access the admin panel:

1. **Admin Button**: A semi-transparent settings button appears in the bottom-right corner of the chat page. Click this button to open the admin panel.

2. **Keyboard Shortcuts**:
   - `Shift + Ctrl + A`: Open the admin modal on any page
   - `Shift + Ctrl + M`: Navigate directly to the admin models page

3. **Direct URL**: Navigate to `/admin/models` to access the standalone admin page (requires admin authentication).

4. **Dashboard Link**: When in admin mode, an "Admin Settings" button will appear in the dashboard.

### Admin Authentication

To access admin features, you need the admin password:

- Default password: `rflkt-admin`

Once you've entered the password in either the modal or the admin page, you'll remain in admin mode until you explicitly log out or clear your browser storage.

### Available Model Providers

RFLKT currently supports two model providers:

1. **OpenAI**
   - Models: gpt-4o-mini, gpt-3.5-turbo, gpt-4o
   - Requires a valid OpenAI API key in the .env file

2. **Gemma (via OpenRouter)**
   - Models: google/gemma-3-27b-it:free
   - Requires a valid OpenRouter API key in the .env file

### Configuration Persistence

Model configuration settings are stored in the browser's localStorage and persist between sessions. This ensures consistent model usage across the application.

## Adding New Model Providers

To add a new model provider:

1. Create a new service file (e.g., `src/services/newprovider.ts`)
2. Implement the `createChatCompletion` function with the same interface
3. Update `src/services/ai.ts` to include the new provider
4. Add the provider to the `ModelProvider` type and `MODEL_OPTIONS` object

## Security Considerations

- The admin password is stored in plaintext in the code and should be changed in a production environment.
- In a real production application, proper authentication and authorization should be implemented.
- API keys should be kept secure and not exposed to client-side code in production. 