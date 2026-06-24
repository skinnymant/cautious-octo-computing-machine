import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: JwtUser, @Body() dto: CheckoutDto) {
    return this.service.checkout(user.id, dto);
  }

  @Get()
  myOrders(@CurrentUser() user: JwtUser) {
    return this.service.findUserOrders(user.id);
  }

  @Get(':code')
  one(@CurrentUser() user: JwtUser, @Param('code') code: string) {
    return this.service.findOne(user.id, code);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('admin/all')
  all() {
    return this.service.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
