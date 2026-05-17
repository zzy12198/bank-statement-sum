import { createWorker } from 'tesseract.js';

const DEFAULT_LANGUAGE = 'chi_sim+eng';

export async function recognizeImage(file, options = {}) {
  const { language = DEFAULT_LANGUAGE, onProgress } = options;

  const worker = await createWorker(language, 1, {
    logger: (message) => {
      if (typeof onProgress === 'function') {
        onProgress(message);
      }
    }
  });

  try {
    const result = await worker.recognize(file);
    return result?.data?.text || '';
  } finally {
    await worker.terminate();
  }
}

export async function processImages(files, handlers = {}) {
  const entries = Array.from(files || []);
  const total = entries.length;
  const results = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const file = entry.file || entry;
    const imageId = entry.id || `image-${index + 1}`;
    const imageName = entry.name || file.name || `图片${index + 1}`;

    handlers.onImageStart?.({ entry, file, imageId, imageName, index, total });

    try {
      const text = await recognizeImage(file, {
        onProgress: (progress) => {
          handlers.onImageProgress?.({
            entry,
            file,
            imageId,
            imageName,
            index,
            total,
            progress
          });
        }
      });

      const result = { entry, file, imageId, imageName, index, total, text };
      results.push(result);
      handlers.onImageSuccess?.(result);
    } catch (error) {
      const failed = {
        entry,
        file,
        imageId,
        imageName,
        index,
        total,
        error
      };
      results.push(failed);
      handlers.onImageError?.(failed);
    }
  }

  handlers.onComplete?.(results);
  return results;
}
