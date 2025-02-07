import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as jwksClient from 'jwks-rsa';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ResponseService } from 'src/shared/response.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  private client: jwksClient.JwksClient;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private responseService: ResponseService,
    private readonly jwtService: JwtService,
  ) {
    // Initialize jwks-rsa client with the JWKS URI
    this.client = jwksClient({
      jwksUri:
        'https://seamfix-iam-lab.iam.seamfix.com/realms/seamfix-iam-lab/protocol/openid-connect/certs',
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      savedUser.password = undefined;

      return savedUser;
    } catch (error) {
      return this.responseService.handleServiceError(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.usersRepository.find({
        select: { password: false },
      });

      return users;
    } catch (error) {
      return this.responseService.handleServiceError(error);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      return user;
    } catch (error) {
      return this.responseService.handleServiceError(error);
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    try {
      const user = await this.findUserByEmail(loginDto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordMatch = await this.comparePassword(
        loginDto.password,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      user.password = undefined;

      const jwt = await this.jwtService.signAsync({ user });

      return {
        access_token: jwt,
      };
    } catch (error) {
      this.responseService.handleServiceError(error);
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async loginWithIam(iamToken: string): Promise<{ access_token: string }> {
    try {
      // Verify Token
      const decodedHeader = this.jwtService.decode(iamToken, {
        complete: true,
      }) as { [key: string]: any };

      if (!decodedHeader) {
        throw new UnauthorizedException('Invalid token');
      }
      const key = await this.getKey(decodedHeader.header);

      // Decode token
      const decodedToken = this.jwtService.verify(iamToken, { secret: key });

      const user = await this.findUserByEmail(decodedToken.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const jwt = await this.jwtService.signAsync({ user });

      return {
        access_token: jwt,
      };
    } catch (error) {
      this.responseService.handleServiceError(error);
    }
  }

  private getKey(header): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key.getPublicKey();
          resolve(signingKey);
        }
      });
    });
  }
}
