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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { Public, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private service: ArticlesService) {}

  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Public()
  @Get('categories')
  categories() {
    return this.service.categories();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
