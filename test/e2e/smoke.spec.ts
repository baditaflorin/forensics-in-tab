import { expect, test } from '@playwright/test';

test('loads the static app and runs a local YARA scan', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Forensics in Tab' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Star on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/forensics-in-tab'
  );
  await expect(page.getByText(/v\d+\.\d+\.\d+/)).toBeVisible();

  await page.getByTestId('evidence-input').setInputFiles({
    name: 'sample-memory.bin',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('MZ cmd.exe http://example.test VirtualAlloc \x55\x48\x89\xe5\x90\xc3')
  });

  await expect(page.getByRole('button', { name: /sample-memory\.bin/i })).toBeVisible();
  await page.getByRole('button', { name: 'YARA' }).click();
  await page.getByRole('button', { name: 'Run Rules' }).click();
  await expect(page.getByRole('heading', { name: 'Suspicious_Triage' })).toBeVisible();
  await expect(page.getByText('Matched')).toBeVisible();
});
