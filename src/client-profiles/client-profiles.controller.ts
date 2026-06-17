import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientProfilesService } from './client-profiles.service';

@Controller('client')
export class ClientProfilesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateClientDto) {
    return this.clientProfilesService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.clientProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProfilesService.findOne(id);
  }
}
