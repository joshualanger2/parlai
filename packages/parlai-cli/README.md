# Parlai CLI

A powerful CLI tool for automating i18n setup and management in React applications.

## Features

- 🚀 One-command i18n setup with automatic dependency installation
- 🔍 Automatically extract hardcoded strings from React components
- 🔄 Transform React components to use i18n hooks and keys
- 🌐 AI-powered translation suggestions
- 📦 Support for both npm and yarn

## Installation

```bash
npm install -g @parlai/cli
# or
yarn global add @parlai/cli
```

## Quick Start

Transform your React app to support i18n in three simple steps:

```bash
# 1. Set up i18n in your project
parlai setup

# 2. Extract strings from your components
parlai extract ./src

# 3. Transform components to use i18n
parlai transform ./src
```

## Commands

### `setup`

Sets up i18n in your React application by:
- Installing required dependencies (i18next, react-i18next)
- Creating i18n configuration files
- Setting up the translation infrastructure

```bash
parlai setup
# or specify package manager
parlai setup --package-manager yarn
parlai setup --package-manager npm
```

### `extract`

Scans your React components and extracts hardcoded strings into a translation file:
- Finds all text content in JSX
- Extracts string literals from attributes
- Generates appropriate translation keys
- Creates/updates `locales/en.json` with extracted strings

```bash
parlai extract <directory>
# Example:
parlai extract ./src
```

### `transform`

Transforms your React components to use i18n:
- Adds necessary imports and hooks
- Replaces hardcoded strings with translation keys
- Handles both text content and attributes (className, placeholder, etc.)
- Makes components async if needed for translation loading
- Requires `locales/en.json` to exist (created by `extract`)

```bash
parlai transform <directory>
# Example:
parlai transform ./src
```

### `translate`

(Optional) Translates extracted strings to other languages using AI:
- Reads source strings from `locales/en.json`
- Generates translations in the `locales` directory

```bash
parlai translate --api-key=your-openai-api-key
# or specify languages
parlai translate --api-key=your-key --source en --target fr es de
```

## Workflow Example

Here's a complete example of internationalizing a React application:

1. Install the CLI tool:
   ```bash
   yarn global add @parlai/cli
   ```

2. Navigate to your React project:
   ```bash
   cd your-react-app
   ```

3. Set up i18n (installs dependencies and creates config):
   ```bash
   parlai setup
   ```
   This creates the necessary configuration files and the `locales` directory.

4. Extract strings from your components:
   ```bash
   parlai extract ./src
   ```
   This creates `locales/en.json` with all your strings.

5. Transform your components to use i18n:
   ```bash
   parlai transform ./src
   ```
   This updates your components to use the translation system.

6. (Optional) Generate translations for other languages:
   ```bash
   parlai translate --api-key=your-openai-api-key --target fr es
   ```
   This creates `locales/fr.json` and `locales/es.json` with translations.

## Notes

- The `setup` command creates a `locales` directory for your translation files
- Run `extract` before `transform` to ensure all strings are captured
- The `transform` command requires `locales/en.json` to exist (created by `extract`)
- Components using translations will be made async to support dynamic loading
- Backup your code before running the transform command

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the CLI:
   ```bash
   yarn build
   ```
4. Run in development mode:
   ```bash
   yarn dev
   ```

## License

MIT 