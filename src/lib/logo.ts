export const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const supportedTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

export function verifyLogo(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      reject(new Error('The image took too long to load. Try another link or upload the file.'));
    }, 12000);
    image.onload = () => {
      clearTimeout(timer);
      if (image.naturalWidth > 0 && image.naturalHeight > 0) resolve();
      else reject(new Error('Choose a valid image for the website logo.'));
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(
        new Error('This image could not be loaded. Use a direct image link or upload a file.'),
      );
    };
    image.src = source;
  });
}

export async function readLogoFile(file: File): Promise<string> {
  if (!supportedTypes.has(file.type))
    throw new Error('Choose a PNG, JPG, WebP, SVG, or GIF image.');
  if (file.size > MAX_LOGO_SIZE)
    throw new Error('Choose a logo smaller than 2 MB for this browser preview.');
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('The image could not be read.'));
    reader.onerror = () =>
      reject(new Error('The image could not be read. Please choose it again.'));
    reader.readAsDataURL(file);
  });
  await verifyLogo(source);
  return source;
}

export function normalizeLogoLink(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Use a complete image link beginning with https:// or http://.');
  }
  if (!['https:', 'http:'].includes(url.protocol))
    throw new Error('Use a direct image link beginning with https:// or http://.');
  return url.href;
}
