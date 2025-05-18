import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { createSpinner } from '../utils/spinner';

interface TranslateOptions {
  dryRun?: boolean;
  apiKey?: string;
}

// Map of language codes to their full names
const languageNames: Record<string, string> = {
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'pl': 'Polish',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
};

async function translateObject(obj: any, targetLang: string, openai: OpenAI): Promise<any> {
  const result: any = {};
  const { spinner, stop } = createSpinner();
  spinner.start();
  
  try {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Translate the string
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are a professional translator. Translate the following text to ${languageNames[targetLang] || targetLang}. Maintain any formatting, variables, or special characters. Only respond with the translation, nothing else.`
              },
              {
                role: "user",
                content: value
              }
            ],
            temperature: 0.3, // Lower temperature for more consistent translations
          });
          
          const translation = response.choices[0]?.message?.content;
          if (!translation) {
            throw new Error('No translation received from OpenAI');
          }
          result[key] = translation.trim();
        } catch (error) {
          console.error(`Error translating "${value}":`, error);
          result[key] = value; // Keep original on error
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively translate nested objects
        result[key] = await translateObject(value, targetLang, openai);
      } else {
        result[key] = value;
      }
    }
    
    stop();
    return result;
  } catch (error) {
    stop();
    throw error;
  }
}

export async function translate(lang: string, options: TranslateOptions = {}): Promise<void> {
  try {
    // Validate language code
    if (!lang.match(/^[a-z]{2}$/)) {
      throw new Error('Invalid language code. Please use a 2-letter language code (e.g., es, fr, de)');
    }

    // Check if language is supported
    if (!languageNames[lang]) {
      console.warn(`Warning: Language code '${lang}' is not in our predefined list, but we'll try to translate anyway.`);
    }

    // Check for OpenAI API key in options first, then environment
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Provide it with --api-key or set OPENAI_API_KEY environment variable');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Check if en.json exists
    const localesDir = path.join(process.cwd(), 'locales');
    const sourceFile = path.join(localesDir, 'en.json');
    if (!fs.existsSync(sourceFile)) {
      throw new Error('locales/en.json not found. Run "parlai extract" first.');
    }

    // Load source translations
    const sourceTranslations = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));

    console.log(`🔄 Translating strings to ${languageNames[lang] || lang}...`);
    
    if (options.dryRun) {
      console.log('\n🔍 Dry run mode - no files will be modified');
    }

    // Translate the strings
    const translatedStrings = await translateObject(sourceTranslations, lang, openai);

    // Save translations
    if (!options.dryRun) {
      const targetFile = path.join(localesDir, `${lang}.json`);
      fs.writeFileSync(
        targetFile,
        JSON.stringify(translatedStrings, null, 2)
      );
      console.log(`\n✨ Translations saved to locales/${lang}.json`);
    } else {
      console.log('\nWould create translations:');
      console.log(JSON.stringify(translatedStrings, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error during translation:', error);
    process.exit(1);
  }
} 