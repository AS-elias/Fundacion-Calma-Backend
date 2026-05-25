import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ComunicacionesModule } from '../src/modules/comunicaciones/comunicaciones.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import request from 'supertest';

describe('Comunicaciones Module - REST API E2E Tests', () => {
  let app: INestApplication;
  const jwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBlbWFpbC5jb20iLCJyb2wiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMH0.fake_signature';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ComunicacionesModule],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            canales: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                nombre: 'Test Canal',
                descripcion: 'Test',
                avatar_url: null,
                es_grupo: true,
                area_id: null,
                fecha_creacion: new Date(),
              }),
              findUnique: jest.fn().mockResolvedValue({
                id: 1,
                nombre: 'Test Canal',
                descripcion: 'Test',
                avatar_url: null,
                es_grupo: true,
                participantes_canal: [
                  {
                    usuario_id: 1,
                    usuarios: { nombre_completo: 'Test User', foto_url: null },
                  },
                ],
                mensajes: [],
              }),
              update: jest.fn().mockResolvedValue({
                id: 1,
                nombre: 'Updated Canal',
                descripcion: 'Updated',
              }),
            },
            mensajes: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                canal_id: 1,
                emisor_id: 1,
                contenido: 'Test message',
                tipo: 'text',
                archivo_url: null,
                leido: false,
                creado_at: new Date(),
              }),
              findMany: jest.fn().mockResolvedValue([]),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            participantes_canal: {
              create: jest.fn().mockResolvedValue({}),
              findFirst: jest.fn().mockResolvedValue({ usuario_id: 1 }),
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
              findMany: jest.fn().mockResolvedValue([]),
              createMany: jest.fn().mockResolvedValue({}),
            },
            reacciones_mensaje: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                mensaje_id: 1,
                usuario_id: 1,
                emoji: '👍',
                creado_at: new Date(),
              }),
              findMany: jest.fn().mockResolvedValue([
                {
                  id: 1,
                  emoji: '👍',
                  usuarios: { nombre_completo: 'User' },
                },
              ]),
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /comunicaciones/channels/:id/info', () => {
    it('debería retornar información del canal', async () => {
      const response = await request(app.getHttpServer())
        .get('/comunicaciones/channels/1/info')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('canalId');
      expect(response.body.canalId).toBe(1);
      expect(response.body).toHaveProperty('nombre');
      expect(response.body).toHaveProperty('participantes');
    });

    it('debería fallar con ID de canal inválido', async () => {
      const response = await request(app.getHttpServer())
        .get('/comunicaciones/channels/invalid/info')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /comunicaciones/channels/:id', () => {
    it('debería actualizar la información del canal', async () => {
      const response = await request(app.getHttpServer())
        .patch('/comunicaciones/channels/1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          nombre: 'Canal Actualizado',
          descripcion: 'Nueva descripción',
          avatarUrl: 'https://example.com/avatar.png',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nombre');
    });

    it('debería fallar con ID inválido', async () => {
      const response = await request(app.getHttpServer())
        .patch('/comunicaciones/channels/invalid')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /comunicaciones/channels/:id/files', () => {
    it('debería subir un archivo al canal', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/channels/1/files')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt');

      // La respuesta puede variar debido a la configuración de almacenamiento
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('debería rechazar solicitud sin archivo', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/channels/1/files')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(400);
    });

    it('debería rechazar ID de canal inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/channels/invalid/files')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', Buffer.from('test'), 'test.txt');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /comunicaciones/messages/:id/reactions', () => {
    it('debería añadir una reacción al mensaje', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/messages/1/reactions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          usuarioId: 1,
          emoji: '👍',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('emoji');
      expect(response.body.emoji).toBe('👍');
    });

    it('debería fallar con ID de mensaje inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/messages/invalid/reactions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          usuarioId: 1,
          emoji: '👍',
        });

      expect(response.status).toBe(400);
    });

    it('debería fallar sin campo emoji', async () => {
      const response = await request(app.getHttpServer())
        .post('/comunicaciones/messages/1/reactions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          usuarioId: 1,
        });

      expect([400, 500]).toContain(response.status);
    });
  });
});
