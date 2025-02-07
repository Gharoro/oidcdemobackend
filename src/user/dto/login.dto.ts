import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Please enter a valid email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter your password' })
  password: string;
}
