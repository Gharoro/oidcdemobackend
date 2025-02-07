import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'src/shared/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
     TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, ResponseService],
})
export class UserModule {}
