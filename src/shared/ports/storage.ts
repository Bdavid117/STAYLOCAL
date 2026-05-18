// Puerto de almacenamiento binario (imágenes de alojamientos).
// Adapter por defecto: LocalStorage en /public/uploads. Cualquier
// reemplazo (R2, S3) debe implementar esta interfaz.

export type StoredFile = {
  url: string;
  bytes: number;
};

export interface StoragePort {
  upload(input: {
    filename: string;
    content: Buffer;
    contentType: string;
  }): Promise<StoredFile>;
  delete(url: string): Promise<void>;
}
