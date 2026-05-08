// Define exactamente qué datos viajan dentro del pasaporte (Token)
export interface JwtPayload {
  sub: number; // El ID del usuario
  email: string; // El correo
  rol: string; // El rol que tiene
}
