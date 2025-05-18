import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function createDemo(appName: string) {
  console.log(`Creating demo app: ${appName}...`);

  // Create Next.js app with TypeScript and Tailwind CSS
  execSync(`npx create-next-app@latest ${appName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`, {
    stdio: 'inherit',
  });

  // Change to app directory
  process.chdir(appName);

  // Create src directory structure
  const srcDir = 'src';
  const appDir = path.join(srcDir, 'app');
  const componentsDir = path.join(srcDir, 'components');
  const localesDir = 'locales';

  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.mkdirSync(componentsDir, { recursive: true });
  fs.mkdirSync(localesDir, { recursive: true });

  // Create empty locales/en.json
  fs.writeFileSync(path.join(localesDir, 'en.json'), '{}');

  // Create sample components with hardcoded text
  const heroContent = `
export function Hero() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to our amazing platform
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Experience the future of web development with our innovative tools and solutions.
            Start your journey today and build something extraordinary.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}`;

  // Create Features component
  const featuresContent = `
export function Features() {
  const features = [
    {
      title: "Easy Integration",
      description: "Seamlessly integrate our tools into your existing workflow with just a few simple steps.",
    },
    {
      title: "Powerful Analytics",
      description: "Get detailed insights and metrics to make data-driven decisions for your business.",
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is always here to help you succeed with your projects.",
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to succeed
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover the tools and features that will help you take your project to the next level.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {feature.title}
                </dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}`;

  // Create Testimonials component
  const testimonialsContent = `
export function Testimonials() {
  const testimonials = [
    {
      quote: "This platform has completely transformed how we handle our projects. The efficiency gains are incredible!",
      author: "Sarah Johnson",
      role: "CTO at TechCorp",
    },
    {
      quote: "The best investment we've made for our development team. The support is outstanding.",
      author: "Michael Chen",
      role: "Lead Developer at StartupX",
    },
    {
      quote: "We've seen a 50% increase in productivity since implementing these tools.",
      author: "Emily Rodriguez",
      role: "Product Manager at InnovateCo",
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by developers worldwide
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="rounded-2xl bg-gray-50 p-8">
                <blockquote className="text-gray-600">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;

  // Write component files
  fs.writeFileSync(path.join(componentsDir, 'Hero.tsx'), heroContent.trim());
  fs.writeFileSync(path.join(componentsDir, 'Features.tsx'), featuresContent.trim());
  fs.writeFileSync(path.join(componentsDir, 'Testimonials.tsx'), testimonialsContent.trim());

  // Update page.tsx
  const pageContent = `
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Testimonials } from '@/components/Testimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
    </main>
  );
}`;

  fs.writeFileSync(path.join('src', 'app', 'page.tsx'), pageContent.trim());

  console.log('\nDemo app created successfully! To get started:');
  console.log(`1. cd ${appName}`);
  console.log('2. yarn dev (or npm run dev)');
  console.log('\nTo set up i18n:');
  console.log('1. parlai setup');
  console.log('2. parlai extract ./src');
  console.log('3. parlai transform ./src');
  console.log('4. parlai translate (optional)');
} 