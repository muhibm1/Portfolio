// Fills a template such as "Step {n}, {label}." from an object of values.
export const fill = (template, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
