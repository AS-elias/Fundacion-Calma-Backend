import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateAnalisisVenueDto } from '../../application/dto/create-analisis-venue.dto';
import { UpdateAnalisisVenueDto } from '../../application/dto/update-analisis-venue.dto';
import { CreateAnalisisVenueUseCase } from '../../application/use-cases/create-analisis-venue.usecase';
import { DeleteAnalisisVenueUseCase } from '../../application/use-cases/delete-analisis-venue.usecase';
import { GetAnalisisVenueUseCase } from '../../application/use-cases/get-analisis-venue.usecase';
import { GetAnalisisVenuesUseCase } from '../../application/use-cases/get-analisis-venues.usecase';
import { UpdateAnalisisVenueUseCase } from '../../application/use-cases/update-analisis-venue.usecase';

@Controller(['analisis-venues', 'analisis_venues'])
export class AnalisisVenuesController {
  constructor(
    private readonly createVenue: CreateAnalisisVenueUseCase,
    private readonly getVenues: GetAnalisisVenuesUseCase,
    private readonly getVenue: GetAnalisisVenueUseCase,
    private readonly updateVenue: UpdateAnalisisVenueUseCase,
    private readonly deleteVenue: DeleteAnalisisVenueUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('estado') estado?: string) {
    return this.getVenues.execute({ search, estado });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getVenue.execute(Number(id));
  }

  @Post()
  create(@Body() dto: CreateAnalisisVenueDto) {
    return this.createVenue.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisVenueDto) {
    return this.updateVenue.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteVenue.execute(Number(id));
  }
}
