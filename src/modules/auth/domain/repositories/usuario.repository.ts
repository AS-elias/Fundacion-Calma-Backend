import { UsuarioEntity } from '../entities/usuario.entity';

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<UsuarioEntity | null>;
  findById(id: number): Promise<UsuarioEntity | null>;
  findAll(): Promise<UsuarioEntity[]>;
  findRoleByName(
    nombre: string,
  ): Promise<{ id: number; nombre: string } | null>;
  create(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>;
  update(id: number, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>;
  delete(id: number): Promise<void>;
}

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';
