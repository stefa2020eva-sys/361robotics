// Test-only stub for the Astro virtual module `astro:content`.
// Re-exports the runtime pieces of zod and defineCollection so that
// schema files importing from `astro:content` can be unit-tested with vitest.
export { z } from 'astro/zod';
export { defineCollection } from 'astro/content/config';
