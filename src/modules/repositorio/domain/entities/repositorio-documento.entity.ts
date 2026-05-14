export class RepositorioDocumento {
  constructor(
    public id: number,
    public bloqueId: number,
    public nombreDocumento: string,
    public urlDocumento: string,
    public fechaAgregado: Date,
  ) {}
}