import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseService } from 'src/shared/response.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/shared/jwt.guard';
import { AuthenticatedRequest } from 'src/shared/interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.responseService.success(
      'User created successfully',
      user,
      HttpStatus.CREATED,
    );
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.userService.login(loginDto);
    return this.responseService.success(
      'Login successfull',
      result,
      HttpStatus.OK,
    );
  }

  @Post('/authenticate-iam')
  async authenticateIam(@Body() body: {access_token: string}) {
    const result = await this.userService.loginWithIam(body.access_token);
    return this.responseService.success(
      'Login successfull',
      result,
      HttpStatus.OK,
    );
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const users = await this.userService.findAll();
    return this.responseService.success('Users fetched', users, HttpStatus.OK);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.responseService.success('Success', user, HttpStatus.OK);
  }
}
