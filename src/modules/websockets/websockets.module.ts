import { Global, Module } from '@nestjs/common';
import { DashboardGateway } from './gateways/dashboard.gateway';

@Global()
@Module({
  providers: [DashboardGateway],
  exports: [DashboardGateway],
})
export class WebsocketsModule {}
