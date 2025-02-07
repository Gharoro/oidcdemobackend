
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter user first name' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter user last name' })
  last_name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Please enter user email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter user password' })
  password: string;
}
