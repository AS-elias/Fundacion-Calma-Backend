import { ConexionConvenio } from '../enums/conexion-convenio.enum';
import { EstadoConvenio } from '../enums/estado-convenio.enum';
import { TipoConvenio } from '../enums/tipo-convenio.enum';

export class Convenio {
  constructor(
    public id: number,
    public areaId: number,
    public entidadNombre: string,
    public logoUrl: string | null,
    public ruc: string,
    public rubro: string,
    public contactoNombre: string,
    public telefonoContacto: string,
    public estado: EstadoConvenio | null,
    public tipo: TipoConvenio | null,
    public conexion: ConexionConvenio | null,
    public fechaExpiracion: Date,
    public creadorId: number,
    public fechaCreacion: Date,
  ) {}
}
