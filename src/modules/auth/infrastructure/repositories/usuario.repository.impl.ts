import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository';

@Injectable()
export class UsuarioRepositoryImpl implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapUsuario(usuario: any): UsuarioEntity {
    return new UsuarioEntity({
      ...usuario,
      rol: usuario.roles ?? null,
    });
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email },
      include: { roles: true },
    });
    return usuario ? this.mapUsuario(usuario) : null;
  }

  async findById(id: number): Promise<UsuarioEntity | null> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      include: { roles: true },
    });
    return usuario ? this.mapUsuario(usuario) : null;
  }

  async findRoleByName(
    nombre: string,
  ): Promise<{ id: number; nombre: string } | null> {
    const rol = await this.prisma.roles.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
      select: { id: true, nombre: true },
    });
    return rol;
  }

  async create(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    const createData: Prisma.usuariosCreateInput = {
      ...usuario,
    } as any;
    delete (createData as any).id;

    // 🔥 PREVENCIÓN: Convertimos la fecha si viene en la creación
    if ((createData as any).fecha_fin_contrato) {
      (createData as any).fecha_fin_contrato = new Date(
        (createData as any).fecha_fin_contrato,
      );
    } else {
      (createData as any).fecha_fin_contrato = null;
    }

    const newUsuario = await this.prisma.usuarios.create({
      data: createData,
      include: { roles: true },
    });
    return this.mapUsuario(newUsuario);
  }

  async update(
    id: number,
    usuario: Partial<UsuarioEntity>,
  ): Promise<UsuarioEntity> {
    const updateData: Prisma.usuariosUpdateInput = {
      ...usuario,
    } as any;
    delete (updateData as any).id;

    // 🔥 SOLUCIÓN DEL ERROR 500 🔥
    // Si viene una fecha como texto, la transformamos a objeto Date (ISO-8601)
    if ((updateData as any).fecha_fin_contrato) {
      (updateData as any).fecha_fin_contrato = new Date(
        (updateData as any).fecha_fin_contrato,
      );
    } else {
      // Si el campo viene vacío o no viene, aseguramos que sea null para Prisma
      (updateData as any).fecha_fin_contrato = null;
    }

    const updatedUsuario = await this.prisma.usuarios.update({
      where: { id },
      data: updateData,
      include: { roles: true },
    });
    return this.mapUsuario(updatedUsuario);
  }

  async findAll(): Promise<UsuarioEntity[]> {
    const usuarios = await this.prisma.usuarios.findMany({
      include: { roles: true },
    });
    return usuarios.map((usuario) => this.mapUsuario(usuario));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.usuarios.delete({
      where: { id },
    });
  }
}
