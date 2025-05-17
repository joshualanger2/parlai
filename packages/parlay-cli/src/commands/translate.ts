import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

interface TranslateOptions {
  apiKey: string;
  source: string;
  target: string[];
}

export async function translate(options: TranslateOptions): Promise<void> {
  try {
    // Read the source translations file
    const sourcePath = path.join(process.cwd(), `${options.source}.json`);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file ${sourcePath} not found. Run 'parlay extract' first.`);
    }

    const sourceStrings = JSON.parse(fs.readFileSync(sourcePath, 'utf-8')) as Record<string, string>;
    const openai = new OpenAI({ apiKey: options.apiKey });

    // Translate to each target language
    for (const targetLang of options.target) {
      console.log(`\n🌐 Translating to ${targetLang}...`);
      const translations: Record<string, string> = {};

      // Process strings in batches to avoid rate limits
      const entries = Object.entries(sourceStrings) as [string, string][];
      const batchSize = 10;

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const batchTranslations = await translateBatch(
          batch,
          targetLang,
          openai
        );
        Object.assign(translations, batchTranslations);

        // Show progress
        console.log(`Progress: ${Math.min(i + batchSize, entries.length)}/${entries.length}`);
      }

      // Write translations to file
      const targetPath = path.join(process.cwd(), `${targetLang}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(translations, null, 2));
      console.log(`✨ Translations saved to ${targetLang}.json`);
    }

  } catch (error) {
    console.error('Error translating strings:', error);
    process.exit(1);
  }
}

async function translateBatch(
  entries: [string, string][],
  targetLang: string,
  openai: OpenAI
): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};
  
  // Prepare the prompt
  const stringsToTranslate = entries
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Translate the following strings to ${targetLang}. Keep the same keys and only translate the values. Return the result in valid JSON format:

${stringsToTranslate}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the given strings accurately while preserving any formatting or special characters. Return only the JSON object with translations."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No translation received from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse translation response');
    }

    const translatedBatch = JSON.parse(jsonMatch[0]);
    Object.assign(translations, translatedBatch);

  } catch (error) {
    console.error(`Error translating batch: ${error}`);
    // Return original strings as fallback
    entries.forEach(([key, value]) => {
      translations[key] = value;
    });
  }

  return translations;
} 