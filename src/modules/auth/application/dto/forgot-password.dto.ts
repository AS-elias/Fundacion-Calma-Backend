import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;
}
