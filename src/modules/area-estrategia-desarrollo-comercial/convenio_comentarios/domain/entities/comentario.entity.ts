export class ConvenioComentario {
  constructor(
    public id: number,
    public convenioId: number,
    public usuarioId: number,
    public comentario: string,
    public fechaCreacion: Date,
  ) {}
}
