import { mkdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function build() {
  console.log('Starting Vercel build...');

  // Clean and create dist folder
  const distDir = path.join(rootDir, 'dist');
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true });
  }
  await mkdir(distDir, { recursive: true });

  // Copy frontend files
  const frontendDir = path.join(rootDir, 'artifacts', 'dot-affiliates', 'dist', 'public');
  const entries = await cp(frontendDir, distDir, { recursive: true, force: true });
  console.log(`Copied frontend files to dist/`);

  // Create api folder and copy serverless functions
  const apiDir = path.join(rootDir, 'api');
  await mkdir(apiDir, { recursive: true });

  const apiServerDist = path.join(rootDir, 'artifacts', 'api-server', 'dist');
  await cp(path.join(apiServerDist, 'vercel.mjs'), path.join(apiDir, 'vercel.mjs'));
  await cp(path.join(apiServerDist, 'index.mjs'), path.join(apiDir, 'index.mjs'));
  console.log(`Copied API files to api/`);

  // Clean up source files to prevent Vercel typecheck issues
  const dirsToRemove = [
    path.join(rootDir, 'artifacts', 'api-server', 'src'),
    path.join(rootDir, 'lib', 'api-zod', 'src'),
    path.join(rootDir, 'lib', 'db', 'src'),
    path.join(rootDir, 'lib', 'api-client-react', 'src'),
  ];

  for (const dir of dirsToRemove) {
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
      console.log(`Removed ${dir}`);
    }
  }

  console.log('Build complete!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
