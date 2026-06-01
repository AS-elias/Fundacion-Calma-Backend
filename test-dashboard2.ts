import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DashboardService } from './src/modules/dashboard/dashboard.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DashboardService);
  const filter = await (ds as any).getAllowedAreaIds(19);
  console.log('filterAreaIds:', filter);
  await app.close();
}
bootstrap();
