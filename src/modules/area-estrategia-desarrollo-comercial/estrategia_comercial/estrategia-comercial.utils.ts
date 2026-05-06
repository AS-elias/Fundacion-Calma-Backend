import { BadRequestException } from '@nestjs/common';
import {
  EstrategiaActividadEstado,
  EstrategiaPrioridad,
  EstrategiaProyectoEstado,
} from '@prisma/client';

export function text(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

export function requiredText(value: unknown, field: string): string {
  const normalized = text(value);
  if (!normalized) throw new BadRequestException(`${field} es obligatorio.`);
  return normalized;
}

export function int(value: unknown, field: string): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestException(`${field} debe ser un numero valido.`);
  }
  return parsed;
}

export function positiveId(value: string | number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('El id es invalido.');
  }
  return parsed;
}

export function date(value: unknown, field: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = new Date(String(value).trim());
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} debe tener un formato valido.`);
  }
  return parsed;
}

function key(value: unknown): string | undefined {
  const normalized = text(value);
  if (!normalized) return undefined;
  return normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function actividadEstado(
  value: unknown,
): EstrategiaActividadEstado | undefined {
  const normalized = key(value);
  if (!normalized) return undefined;

  const values: Record<string, EstrategiaActividadEstado> = {
    PENDIENTE: EstrategiaActividadEstado.PENDIENTE,
    'EN PROGRESO': EstrategiaActividadEstado.EN_PROGRESO,
    'EN REVISION': EstrategiaActividadEstado.EN_REVISION,
    'EN EJECUCION': EstrategiaActividadEstado.EN_EJECUCION,
    FINALIZADO: EstrategiaActividadEstado.FINALIZADO,
    PARALIZADO: EstrategiaActividadEstado.PARALIZADO,
    COMPLETADO: EstrategiaActividadEstado.COMPLETADO,
  };

  const mapped = values[normalized];
  if (!mapped) throw new BadRequestException('estado de actividad no valido.');
  return mapped;
}

export function prioridad(value: unknown): EstrategiaPrioridad | undefined {
  const normalized = key(value);
  if (!normalized) return undefined;

  const values: Record<string, EstrategiaPrioridad> = {
    ALTA: EstrategiaPrioridad.ALTA,
    MEDIA: EstrategiaPrioridad.MEDIA,
    BAJA: EstrategiaPrioridad.BAJA,
  };

  const mapped = values[normalized];
  if (!mapped) throw new BadRequestException('prioridad no valida.');
  return mapped;
}

export function proyectoEstado(
  value: unknown,
): EstrategiaProyectoEstado | undefined {
  const normalized = key(value);
  if (!normalized) return undefined;

  const values: Record<string, EstrategiaProyectoEstado> = {
    PENDIENTE: EstrategiaProyectoEstado.PENDIENTE,
    'EN PROGRESO': EstrategiaProyectoEstado.EN_PROGRESO,
    COMPLETADA: EstrategiaProyectoEstado.COMPLETADA,
    COMPLETADO: EstrategiaProyectoEstado.COMPLETADA,
    PARALIZADO: EstrategiaProyectoEstado.PARALIZADO,
  };

  const mapped = values[normalized];
  if (!mapped) throw new BadRequestException('estado de proyecto no valido.');
  return mapped;
}
