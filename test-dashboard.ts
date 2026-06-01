import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DashboardService } from './src/modules/dashboard/dashboard.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DashboardService);
  const stats = await ds.getUserStats(19);
  console.log('Actividad Reciente:', stats.actividadReciente);
  await app.close();
}
bootstrap();
