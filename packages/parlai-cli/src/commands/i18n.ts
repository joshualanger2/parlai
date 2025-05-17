import { extract } from './extract';
import { transform } from './transform';

export async function i18n(dir: string): Promise<void> {
  try {
    console.log('🔍 Extracting strings from components...');
    await extract(dir);

    console.log('\n🔄 Transforming components to use i18n...');
    await transform(dir);

    console.log('\n✨ All done! Your components are now internationalized.');
    console.log('\nNext steps:');
    console.log('1. Check the transformed components in your editor');
    console.log('2. Run your app to verify everything works');
    console.log('3. (Optional) Run "parlai translate" to generate translations');
  } catch (error) {
    console.error('\n❌ Error during i18n process:', error);
    process.exit(1);
  }
} 