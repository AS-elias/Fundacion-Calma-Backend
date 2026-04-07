export class CreateConvenioDto {
  areaId!: number;
  entidadNombre!: string;
  logoUrl?: string;
  ruc!: string;
  rubro!: string;
  contactoNombre!: string;
  telefonoContacto!: string;
  estado!: string;
  fechaExpiracion!: Date;
  creadorId!: number;
}
