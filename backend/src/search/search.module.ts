import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiService } from './ai.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, AiService],
  exports: [SearchService, AiService],
})
export class SearchModule {}
