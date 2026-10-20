import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRoleEnum } from '../common/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('role') role?: UserRoleEnum,
  ) {
    if (role) {
      return this.usersService.findAvailableByRole(search || '', role);
    }
    return this.usersService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
