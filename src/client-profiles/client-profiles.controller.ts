import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientProfilesService } from './client-profiles.service';
import { Roles } from '../common/decorators/roles.decorator';
import { GetClientsFilterDto } from './dto/get-clients-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('client')
@UseGuards(RolesGuard, PermissionsGuard)
export class ClientProfilesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) { }

  @Post()
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createCompanyDto: CreateClientDto) {
    return this.clientProfilesService.create(createCompanyDto);
  }

  @Get()
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll(@Query() filterDto: GetClientsFilterDto) {
    return this.clientProfilesService.findPaginated(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOne(@Param('id') id: string) {
    return this.clientProfilesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientProfilesService.update(id, updateClientDto);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.clientProfilesService.updateStatus(id, updateStatusDto);
  }
}
