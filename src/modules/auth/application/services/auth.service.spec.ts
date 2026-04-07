/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../../../core/services/email.service';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USUARIO_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findRoleByName: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendNewUserNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
