import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  email: string;

  @IsString({ message: 'La contraseña temporal es obligatoria' })
  tempPassword: string;

  @IsString()
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword: string;
}
