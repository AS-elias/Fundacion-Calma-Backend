export class ContactoEntity {
  constructor(
    public readonly id: number,
    public readonly nombreCompleto: string,
    public readonly apellidoCompleto: string,
    public readonly email: string,
    public readonly telefono: string | null,
    public readonly puesto: string | null,
    public readonly fotoUrl: string | null,
    public readonly estado: string | null,

    // Campos extra que necesitamos específicamente para pintar las tarjetas en el Frontend
    public readonly rolNombre?: string,
    public readonly areaPrincipal?: string,
    public readonly iniciales?: string,
    public readonly online?: boolean,
    public readonly biografia?: string | null,
    public readonly linkedinUrl?: string | null,
    public readonly fechaNacimiento?: Date | string | null,
  ) {}

  // Aquí podríamos tener métodos de negocio puros en el futuro.
  // Por ejemplo:
  // public estaActivo(): boolean { return this.estado === 'ACTIVO'; }
}
