import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientProfilesService } from './client-profiles.service';
import { GetClientsFilterDto } from './dto/get-clients-filter.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { Permission } from '../roles/enums/permission.enum';

@Controller(['client', 'clients'])
@UseGuards(PermissionsGuard)
export class ClientProfilesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {}

  @Post()
  @RequirePermissions(Permission.CLIENTS_CREATE)
  create(@Body() createCompanyDto: CreateClientDto) {
    return this.clientProfilesService.create(createCompanyDto);
  }

  @Get()
  @RequirePermissions(Permission.CLIENTS_READ)
  findAll(@Query() filterDto: GetClientsFilterDto) {
    return this.clientProfilesService.findPaginated(filterDto);
  }

  @Get(':id')
  @RequirePermissions(Permission.CLIENTS_READ)
  findOne(@Param('id') id: string) {
    return this.clientProfilesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.CLIENTS_UPDATE)
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientProfilesService.update(id, updateClientDto);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.CLIENTS_UPDATE)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.clientProfilesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.CLIENTS_DELETE)
  remove(@Param('id') id: string) {
    return this.clientProfilesService.remove(id);
  }
}
