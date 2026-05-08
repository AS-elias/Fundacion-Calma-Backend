export class Archivo {
  constructor(
    public id: number,
    public convenioId: number,
    public subidoPorId: number,
    public nombreArchivo: string,
    public urlArchivo: string,
    public fechaSubida: Date,
  ) {}
}
