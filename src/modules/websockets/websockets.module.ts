import { Global, Module } from '@nestjs/common';
import { DashboardGateway } from './gateways/dashboard.gateway';
import { SystemGateway } from './gateways/system.gateway';

@Global()
@Module({
  providers: [DashboardGateway, SystemGateway],
  exports: [DashboardGateway, SystemGateway],
})
export class WebsocketsModule {}
