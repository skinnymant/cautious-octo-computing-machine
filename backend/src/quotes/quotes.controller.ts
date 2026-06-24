import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto';
import { CurrentUser, JwtUser, Public, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private service: QuotesService) {}

  // Public: guests can request a quote without an account.
  @Public()
  @Post()
  create(@Body() dto: CreateQuoteDto, @Req() req: any) {
    return this.service.create(req.user?.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: JwtUser) {
    return this.service.findUserQuotes(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('admin/all')
  all() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
