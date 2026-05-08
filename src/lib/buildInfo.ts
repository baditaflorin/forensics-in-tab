import { z } from 'zod';

const buildInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  commit: z.string(),
  fullCommit: z.string(),
  builtAt: z.string(),
  repository: z.string().url(),
  paypal: z.string().url()
});

export type BuildInfo = z.infer<typeof buildInfoSchema>;

export async function fetchBuildInfo(): Promise<BuildInfo> {
  const response = await fetch(`${import.meta.env.BASE_URL}build-info.json`, {
    cache: 'no-cache'
  });

  if (!response.ok) {
    throw new Error('Build metadata is unavailable.');
  }

  return buildInfoSchema.parse(await response.json());
}
