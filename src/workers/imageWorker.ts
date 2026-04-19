import imageCompression from 'browser-image-compression';

type WorkerMessage = 
  | { type: 'COMPRESS_IMAGE'; payload: { file: File; options: any } };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'COMPRESS_IMAGE': {
        const compressedFile = await imageCompression(payload.file, payload.options);
        
        self.postMessage({ 
          type: 'SUCCESS', 
          payload: { 
            file: compressedFile,
            originalSize: payload.file.size,
            compressedSize: compressedFile.size
          } 
        });
        break;
      }

      default:
        self.postMessage({ type: 'ERROR', payload: { error: 'Unknown operation' } });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: { error: error instanceof Error ? error.message : 'Unknown error' } });
  }
};
