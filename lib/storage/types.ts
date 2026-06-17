export type StoredFile = {
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
};

export interface FileStorageService {
  save(buffer: Buffer, targetDir: string, originalFileName: string): Promise<StoredFile>;
  read(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
  move(tempPath: string, targetDir: string, originalFileName: string): Promise<StoredFile>;
  exists(storagePath: string): Promise<boolean>;
}
