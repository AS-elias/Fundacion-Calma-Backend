import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString()
  token!: string;

  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  newPassword!: string;
}
