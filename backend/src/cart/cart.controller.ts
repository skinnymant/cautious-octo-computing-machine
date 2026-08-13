import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser, JwtUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private service: CartService) {}

  @Get()
  get(@CurrentUser() user: JwtUser) {
    return this.service.get(user.id);
  }

  @Post('items')
  add(
    @CurrentUser() user: JwtUser,
    @Body() body: { productId: string; quantity?: number },
  ) {
    return this.service.addItem(user.id, body.productId, body.quantity ?? 1);
  }

  @Patch('items/:productId')
  update(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.service.updateItem(user.id, productId, body.quantity);
  }

  @Delete('items/:productId')
  remove(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.service.removeItem(user.id, productId);
  }

  @Delete()
  clear(@CurrentUser() user: JwtUser) {
    return this.service.clear(user.id);
  }
}
