export class Notificacion {
  constructor(
    public id: number,
    public titulo: string,
    public mensaje: string,
    public tipo: 'sistema' | 'comunicados',
    public leido: boolean,
    public fecha: Date,
    public imagen?: string,
  ) {}
}
