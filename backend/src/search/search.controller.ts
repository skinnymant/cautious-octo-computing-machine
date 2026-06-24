import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { AiService } from './ai.service';
import { Public } from '../common/decorators';

@ApiTags('search & ai')
@Controller()
export class SearchController {
  constructor(
    private search: SearchService,
    private ai: AiService,
  ) {}

  @Public()
  @Get('search')
  query(@Query('q') q: string) {
    return this.search.search(q ?? '');
  }

  @Public()
  @Get('search/suggest')
  suggest(@Query('q') q: string) {
    return this.search.suggest(q ?? '');
  }

  @Public()
  @Post('search/reindex')
  reindex() {
    return this.search.reindexAll();
  }

  @Public()
  @Post('ai/search')
  smartSearch(@Body() body: { query: string }) {
    return this.ai.smartSearch(body.query);
  }

  @Public()
  @Get('ai/recommend/:productId')
  recommend(@Param('productId') productId: string) {
    return this.ai.recommend(productId);
  }

  @Public()
  @Post('ai/chat')
  chat(@Body() body: { message: string }) {
    return this.ai.chat(body.message);
  }

  @Public()
  @Post('ai/quote-assist')
  quoteAssist(@Body() body: { text: string }) {
    return this.ai.quoteAssist(body.text);
  }
}
