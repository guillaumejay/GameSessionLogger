import type { Event } from '../models/Event';

export function escapeMarkdownCharacters(text: string): string {
  // Escape special markdown characters: pipe (|), backslash (\), and newlines
  return text
    .replace(/\\/g, '\\\\')  // Escape backslash first
    .replace(/\|/g, '\\|')   // Escape pipe
    .replace(/\n/g, ' ');    // Replace newlines with space
}

export function formatEventsAsMarkdownTable(events: Event[]): string {
  if (events.length === 0) {
    return '';
  }

  // Create table header
  const header = '| Time | Event Type | Description |';
  const separator = '|------|------------|-------------|';

  // Create table rows
  const rows = events.map(event => {
    const time = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(event.timestamp));

    const description = event.description
      ? escapeMarkdownCharacters(event.description)
      : '';

    return `| ${time} | ${event.tag} | ${description} |`;
  });

  // Combine all parts
  return [header, separator, ...rows].join('\n');
}
