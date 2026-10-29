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
