import { ConexionConvenio } from '../../domain/enums/conexion-convenio.enum';
import { EstadoConvenio } from '../../domain/enums/estado-convenio.enum';
import { TipoConvenio } from '../../domain/enums/tipo-convenio.enum';

export class UpdateConvenioDto {
  entidadNombre?: string;
  logoUrl?: string;
  ruc?: string;
  rubro?: string;
  contactoNombre?: string;
  telefonoContacto?: string;
  estado?: EstadoConvenio;
  fechaExpiracion?: Date;
  tipo?: TipoConvenio;
  conexion?: ConexionConvenio;
}
