# Parlay CLI

A powerful CLI tool for extracting and managing i18n translations in React applications.

## Features

- 🔍 Automatically extract hardcoded strings from React components
- 🌐 Generate i18n-compatible translation keys
- 🤖 AI-powered translation suggestions using OpenAI
- 📦 Export translations to JSON format

## Installation

```bash
npm install @parlai/cli
# or
yarn add @parlai/cli
```

## Usage

### Extract Strings

Extract hardcoded strings from your React components:

```bash
parlay extract ./src
```

This will:
1. Scan all `.tsx` and `.jsx` files in the specified directory
2. Extract text content and string literals
3. Generate appropriate i18n keys
4. Create an `en.json` file with the extracted strings

### Translate Strings

Translate the extracted strings to other languages using AI:

```bash
parlay translate --api-key=your-openai-api-key
```

Options:
- `--api-key`: Your OpenAI API key (required)
- `--source`: Source language file (default: 'en')
- `--target`: Target languages to translate to (default: ['fr', 'es'])

Example:
```bash
parlay translate --api-key=sk-xxx --target fr es de
```

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