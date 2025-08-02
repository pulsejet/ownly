/**
 * Forms the tab name for the browser from a label
 * @param label workspace label, view name, etc. Defaults to empty string
 * @returns "Ownly" if label is empty, otherwise "\<label\> - Ownly"
 */
export function formTabName(label: string = ''): string {
  label = label.trim();

  if (!label) {
    return 'Ownly';
  }
  return `${label} - Ownly`;
}
