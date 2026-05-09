export function downloadTextFile(
  filename: string,
  content: string,
  type = 'text/plain;charset=utf-8'
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, value: unknown) {
  downloadTextFile(filename, `${JSON.stringify(value, null, 2)}\n`, 'application/json');
}

export function downloadCsvFile(filename: string, rows: string[][]) {
  const content = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
    .join('\n');
  downloadTextFile(filename, `${content}\n`, 'text/csv;charset=utf-8');
}

export async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}
