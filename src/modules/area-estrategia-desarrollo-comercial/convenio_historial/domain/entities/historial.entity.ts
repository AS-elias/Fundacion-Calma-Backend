export class ConvenioHistorial {
  constructor(
    public id: number,
    public convenioId: number,
    public usuarioId: number | null,
    public accion: string,
    public descripcion: string,
    public fechaCreacion: Date,
  ) {}
}
