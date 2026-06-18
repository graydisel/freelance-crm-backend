import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientProfilesService } from './client-profiles.service';
import {Roles} from "../auth/decorators/roles.decorator";
import {GetClientsFilterDto} from "./dto/get-clients-filter.dto";

@Controller('client')
export class ClientProfilesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateClientDto) {
    return this.clientProfilesService.create(createCompanyDto);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() filterDto: GetClientsFilterDto) {
    return this.clientProfilesService.findPaginated(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProfilesService.findOne(id);
  }
}
