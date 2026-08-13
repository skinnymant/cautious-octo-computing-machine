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
import { UsersService } from './users.service';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.service.profile(user.id);
  }

  @Patch('me')
  update(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.service.updateProfile(user.id, body);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() user: JwtUser, @Body() body: any) {
    return this.service.addAddress(user.id, body);
  }

  @Get('me/wishlist')
  wishlist(@CurrentUser() user: JwtUser) {
    return this.service.wishlist(user.id);
  }

  @Post('me/wishlist/:productId')
  toggleWishlist(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.service.toggleWishlist(user.id, productId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  all() {
    return this.service.findAll();
  }
}
