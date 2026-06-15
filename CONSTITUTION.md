# 📜 CONSTITUTION — Vyma Backend

> **Vigencia:** Este documento es la fuente de verdad para todo el desarrollo del proyecto. Todo desarrollador humano o agente de IA que colabore en este repositorio está sujeto a estas reglas sin excepción. Cualquier código que viole estas directrices debe ser rechazado en Code Review.

---

## Tabla de Contenidos

1. [Propósito y Principios Fundamentales](#1-propósito-y-principios-fundamentales)
2. [Arquitectura Global y Estructura de Carpetas](#2-arquitectura-global-y-estructura-de-carpetas)
3. [Convenciones de Nomenclatura](#3-convenciones-de-nomenclatura)
4. [Inyección de Dependencias](#4-inyección-de-dependencias)
5. [Validación de Entradas (DTOs)](#5-validación-de-entradas-dtos)
6. [Manejo de Errores y Excepciones](#6-manejo-de-errores-y-excepciones)
7. [Capa de Acceso a Datos — Patrón Repositorio](#7-capa-de-acceso-a-datos--patrón-repositorio)
8. [Arquitectura Orientada a Eventos (EDA)](#8-arquitectura-orientada-a-eventos-eda)
9. [Seguridad](#9-seguridad)
10. [Rendimiento y Optimización de Base de Datos](#10-rendimiento-y-optimización-de-base-de-datos)
11. [Tipado Estricto](#11-tipado-estricto)
12. [Logging y Observabilidad](#12-logging-y-observabilidad)
13. [Configuración de Entorno](#13-configuración-de-entorno)
14. [Testing](#14-testing)
15. [Documentación de API](#15-documentación-de-api)
16. [Directivas para Agentes de IA](#16-directivas-para-agentes-de-ia)

---

## 1. Propósito y Principios Fundamentales

Este documento establece las directrices de diseño de software, convenciones de nomenclatura, patrones técnicos obligatorios y estándares de calidad para el proyecto **Vyma Backend**. El objetivo es mantener la cohesión del código, garantizar la máxima testabilidad y escalabilidad, y evitar acoplamientos innecesarios.

### Principios Rectores

| Principio | Descripción |
|-----------|-------------|
| **Clean Architecture** | El flujo de dependencias siempre apunta hacia adentro: `Controller → Service → Repository`. Nunca al revés. |
| **Single Responsibility** | Cada clase, módulo y función tiene una única razón para cambiar. |
| **Dependency Inversion** | Los módulos de alto nivel no dependen de módulos de bajo nivel. Ambos dependen de abstracciones (interfaces). |
| **Open/Closed** | El código está abierto a extensión pero cerrado a modificación. Usar eventos y patrones para extender comportamiento. |
| **Fail Fast** | Validar configuración e inputs en el borde del sistema, no en el núcleo. |
| **Zero Trust Input** | Todo input externo es sospechoso hasta que es validado y tipado. |

---

## 2. Arquitectura Global y Estructura de Carpetas

El proyecto se organiza bajo una **Arquitectura Modular basada en Features** (características del negocio), no en capas técnicas genéricas.

### Estructura General (`src/`)

```
src/
├── main.ts                       # Bootstrap de la aplicación
├── app.module.ts                 # Módulo raíz
├── common/                       # Utilidades estrictamente reutilizables y sin lógica de negocio
│   ├── decorators/               # Decoradores compartidos
│   ├── filters/                  # Filtros de excepción globales (ej: all-exceptions.filter.ts)
│   ├── guards/                   # Guards globales o reutilizables
│   ├── helpers/                  # Funciones de ayuda generales (ej: transaction.helper.ts)
│   ├── interceptors/             # Interceptores compartidos
│   └── pipes/                    # Pipes de transformación/validación comunes
├── database/                     # Configuración de base de datos
│   └── migrations/               # Migraciones de TypeORM (nunca editar manualmente)
└── [feature-name]/               # Módulo auto-contenido (ej: auth, users, schedules)
    ├── [feature].module.ts
    ├── [feature].controller.ts
    ├── [feature].controller.spec.ts
    ├── [feature].service.ts
    ├── [feature].service.spec.ts
    ├── constants/                 # Constantes del módulo
    ├── cron/                      # Tareas programadas del módulo
    ├── decorators/                # Decoradores propios
    ├── dto/
    │   ├── index.ts               # Re-exportaciones limpias de todos los DTOs
    │   └── [action]-[entity].dto.ts
    ├── entities/                  # Entidades TypeORM
    ├── exceptions/                # Excepciones de negocio (ej: user-not-found.exception.ts)
    ├── events/                    # Clases de eventos de dominio
    ├── guards/                    # Guards específicos del módulo
    ├── interfaces/                # Interfaces de tipado internas
    ├── listeners/                 # Listeners de eventos inter-módulo
    ├── repositories/              # Repositorios personalizados
    └── strategies/                # Estrategias de Passport/Auth
```

### Reglas Obligatorias de Estructura

1. **Módulos Autónomos**: Cada feature module agrupa sus propios controladores, servicios, repositorios, DTOs, entidades, excepciones y listeners. No se mezclan responsabilidades entre módulos directamente.
2. **`common/` Exclusivamente Genérico**: Solo alberga código reutilizable sin dependencias de lógica de negocio. Si tiene lógica de negocio, pertenece al módulo.
3. **Barrel Exports en DTOs**: La carpeta `dto/` de cada módulo **debe** incluir un `index.ts` que exporte todos sus DTOs.
4. **Excepciones Modulares en Archivos Separados**: Cada excepción de negocio reside en su propio archivo dentro de `exceptions/`.
5. **No Inventar Carpetas**: No crear subcarpetas fuera de la estructura establecida. Si se necesita una nueva carpeta, documentarla aquí primero.

---

## 3. Convenciones de Nomenclatura

### Tabla de Casing y Sufijos

| Tipo de Elemento | Casing | Sufijo Obligatorio | Ejemplo |
|:---|:---|:---|:---|
| **Archivos** | `kebab-case` | `.module.ts` · `.controller.ts` · `.service.ts` · `.repository.ts` · `.dto.ts` · `.entity.ts` · `.guard.ts` · `.strategy.ts` · `.filter.ts` · `.decorator.ts` · `.spec.ts` · `.interface.ts` · `.listener.ts` · `.exception.ts` | `create-user.dto.ts` |
| **Clases** | `PascalCase` | Nombre descriptivo + rol o `Exception` | `AuthController` · `CreateUserDto` · `UserNotFoundException` |
| **Métodos y Funciones** | `camelCase` | Verbos de acción | `activateAccount()` · `findByEmail()` |
| **Variables y Propiedades** | `camelCase` | Ninguno | `passwordHash` · `expiresAt` |
| **Interfaces** | `PascalCase` | Prefijo `I` si es genérica/repositorio | `JwtPayload` · `IUserRepository` |
| **Módulos (clase)** | `PascalCase` | `Module` | `AuthModule` · `UsersModule` |
| **Enums (clase)** | `PascalCase` | Ninguno | `NewsCategory` |
| **Miembros de Enum** | `UPPER_SNAKE_CASE` | Ninguno | `NewsCategory.BREAKING_NEWS` |
| **Constantes** | `UPPER_SNAKE_CASE` | Ninguno | `JWT_SECRET` · `ROLES_KEY` |
| **Tokens de Inyección** | `UPPER_SNAKE_CASE` | Ninguno | `USER_REPOSITORY` |

### Reglas de Nomenclatura

- Los nombres de archivos deben describir claramente su propósito sin abreviaciones crípticas.
- Los métodos deben comenzar con verbos: `create`, `find`, `update`, `delete`, `send`, `emit`, `validate`, `build`.
- Las interfaces de repositorio deben usar el prefijo `I`: `IUsersRepository`.
- Los eventos deben nombrarse como hechos del pasado: `UserCreatedEvent`, `ScheduleCancelledEvent`.

---

## 4. Inyección de Dependencias

### Constructor Injection — Obligatorio

```typescript
// CORRECTO
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
}

// PROHIBIDO — Property Injection
@Injectable()
export class AuthService {
  @Inject(UsersRepository)
  private usersRepository: UsersRepository;
}
```

### Service Locator — Terminantemente Prohibido

```typescript
// PROHIBIDO — Oculta dependencias y rompe la testabilidad
export class SomeService {
  constructor(private moduleRef: ModuleRef) {}

  doSomething() {
    const service = this.moduleRef.get(OtherService); // NUNCA
  }
}
```

### Tokens de Inyección para Interfaces

Cuando se depende de una abstracción (interfaz), se debe usar un token de inyección:

```typescript
// interfaces/user-repository.interface.ts
export const USER_REPOSITORY = 'USER_REPOSITORY';
export interface IUsersRepository {
  findById(id: number): Promise<User | null>;
  save(user: Partial<User>): Promise<User>;
}

// En el módulo
{ provide: USER_REPOSITORY, useClass: UsersRepository }

// En el consumidor
constructor(
  @Inject(USER_REPOSITORY)
  private readonly usersRepository: IUsersRepository,
) {}
```

### Principio de Segregación de Interfaces (ISP)

No crear interfaces gigantescas. Cada contrato debe ser pequeño y enfocado:

```typescript
// PROHIBIDO — Interface "God"
interface IUsersRepository {
  findById(): Promise<User>;
  findByEmail(): Promise<User>;
  sendEmail(): Promise<void>;       // No pertenece aquí
  generateReport(): Promise<void>;  // No pertenece aquí
}

// CORRECTO — Interfaces segregadas
interface IUsersRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: Partial<User>): Promise<User>;
}
```

---

## 5. Validación de Entradas (DTOs)

### Reglas Obligatorias de DTOs

1. **Todo endpoint** recibe un DTO validado — nunca `any`, nunca `object` sin tipo.
2. **Cada propiedad** del DTO debe tener al menos un decorador de `class-validator`.
3. **Toda propiedad** debe documentarse con `@ApiProperty()` de `@nestjs/swagger`.
4. **Propiedades opcionales** deben marcarse con `@IsOptional()` antes de su decorador principal.

```typescript
// CORRECTO
export class CreateUserDto {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'user@vyma.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña segura (mín. 8 caracteres)', example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}

// PROHIBIDO
export class CreateUserDto {
  email: any;       // Sin tipo ni validación
  password: string; // Sin decorador de validación
}
```

### Global Validation Pipe

Configurar `ValidationPipe` de forma global en `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Eliminar propiedades no declaradas en el DTO
    forbidNonWhitelisted: true, // Rechazar si llegan propiedades extras
    transform: true,            // Transformar automáticamente los tipos
  }),
);
```

---

## 6. Manejo de Errores y Excepciones

### Excepciones HTTP de NestJS — Obligatorio

```typescript
// CORRECTO
throw new NotFoundException(`User with id ${id} not found`);
throw new ConflictException('Email already registered');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Invalid input data');
throw new InternalServerErrorException('Unexpected error occurred');

// PROHIBIDO
throw new Error('Something went wrong'); // Error genérico de JS
```

### Excepciones Modulares en Archivos Separados

```typescript
// src/users/exceptions/user-not-found.exception.ts
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`User with id ${id} was not found`);
  }
}
```

### Captura de Errores de Base de Datos

Los errores nativos del motor de BD deben capturarse y mapearse en la capa de servicio:

```typescript
try {
  return await this.usersRepository.save(user);
} catch (error) {
  if (error.code === '23505') { // PostgreSQL: unique_violation
    throw new ConflictException('El email ya está registrado');
  }
  throw new InternalServerErrorException();
}
```

### Filtro de Excepciones Global

Configurar un filtro en `src/common/filters/all-exceptions.filter.ts` que:
- Intercepte todas las excepciones no controladas.
- Formatee la respuesta con estructura consistente.
- Loguee el stack trace completo usando el `Logger` de NestJS.
- **Nunca** exponga detalles internos al cliente en producción.

### Manejo de Errores en Async

```typescript
// CORRECTO — try/catch explícito en operaciones async
async processPayment(dto: PaymentDto): Promise<void> {
  try {
    await this.paymentGateway.charge(dto);
  } catch (error) {
    this.logger.error('Payment failed', error.stack);
    throw new InternalServerErrorException('Payment processing failed');
  }
}

// PROHIBIDO — Promesas sin manejo de error
processPayment(dto: PaymentDto): void {
  this.paymentGateway.charge(dto); // Fire-and-forget sin control
}
```

---

## 7. Capa de Acceso a Datos — Patrón Repositorio

### Flujo Obligatorio

```
Controller → Service → Repository → Database
```

### Terminantemente Prohibido en Services

```typescript
// PROHIBIDO — Inyectar Repository<Entity> directamente en un Service
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // NUNCA en un Service
  ) {}
}

// PROHIBIDO — Inyectar DataSource en un Service
@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {} // NUNCA
}
```

### Repositorios Personalizados

```typescript
// src/users/repositories/users.repository.ts
@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async createWithProfile(
    userData: CreateUserDto,
    profileData: CreateProfileDto,
  ): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(User, userData);
      await manager.save(Profile, { ...profileData, userId: user.id });
      return user;
    });
  }
}
```

### Transacciones para Operaciones Multi-Paso

Cuando múltiples operaciones de BD deben ser atómicas, usar `DataSource.transaction()` para rollback automático:

```typescript
return this.dataSource.transaction(async (manager) => {
  const order = await manager.save(Order, orderData);
  await manager.save(OrderItem, { orderId: order.id, ...itemData });
  return order;
  // Si cualquier operación falla, todo se revierte automáticamente
});
```

### Uso de QueryBuilder

Usar `QueryBuilder` para consultas complejas con joins, filtros dinámicos y ordenamiento. Evitar raw queries (`query()`) salvo en migraciones.

---

## 8. Arquitectura Orientada a Eventos (EDA)

### Principio

Cuando un módulo necesita reaccionar al estado de otro módulo sin acoplamiento directo (especialmente para operaciones secundarias como envío de emails, notificaciones WhatsApp, auditorías), se usa el sistema de eventos con `@nestjs/event-emitter`.

### Emitir Eventos de Dominio

```typescript
// src/users/events/user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// En el servicio — emitir después de la operación principal
this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id, user.email, user.name));
```

### Listeners en su Propio Módulo

```typescript
// src/notifications/listeners/user-notifications.listener.ts
@Injectable()
export class UserNotificationsListener {
  private readonly logger = new Logger(UserNotificationsListener.name);

  @OnEvent('user.created', { async: true })
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    try {
      await this.notificationsService.sendWelcomeEmail(event.email);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error.stack, {
        userId: event.userId,
      });
    }
  }
}
```

### Anti-Patrones de Acoplamiento

```typescript
// PROHIBIDO — Importar directamente servicio ajeno para operaciones secundarias
@Injectable()
export class UsersService {
  constructor(private notificationsService: NotificationsService) {} // Acoplamiento fuerte

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.save(dto);
    await this.notificationsService.sendWelcomeEmail(user.email); // Bloquea el hilo principal
    return user;
  }
}
```

---

## 9. Seguridad

### Guards en Todos los Endpoints Protegidos

```typescript
// CORRECTO — Guard declarado a nivel de controlador
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string): Promise<UserResponseDto> { ... }

  @Get('public-profile/:id')
  @Public() // Decorador explícito para rutas públicas — documenta intención
  findPublicProfile(@Param('id') id: string): Promise<PublicProfileDto> { ... }
}

// PROHIBIDO — Endpoint sensible sin guard ni @Public() explícito
@Controller('users')
export class UsersController {
  @Get('sensitive-data')
  getSensitiveData() { ... } // Ambiguo: ¿está protegido o no?
}
```

### Rate Limiting

Configurar `ThrottlerModule` globalmente y aplicar límites más estrictos en endpoints sensibles:

```typescript
// app.module.ts — Configuración global
ThrottlerModule.forRoot([
  { name: 'short',  ttl: 1000,  limit: 3   },  // 3 req/segundo
  { name: 'medium', ttl: 10000, limit: 20  },  // 20 req/10 segundos
  { name: 'long',   ttl: 60000, limit: 100 },  // 100 req/minuto
])

// Endpoints de autenticación — más restrictivo
@Post('login')
@Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
async login(@Body() dto: LoginDto) { ... }

// Endpoints de recuperación de contraseña
@Post('forgot-password')
@Throttle({ short: { limit: 3, ttl: 3600000 } }) // 3 por hora
async forgotPassword(@Body() dto: ForgotPasswordDto) { ... }

// Health checks — sin límite
@Get('health')
@SkipThrottle()
check() { return 'OK'; }
```

### JWT Seguro

- El secreto JWT debe tener mínimo **32 caracteres** (validado en startup con Joi).
- Configurar expiración corta para access tokens (recomendado: `15m`).
- Usar refresh tokens para sesiones largas.
- **Nunca** loguear el payload completo del JWT.

### Sanitización de Output

- Usar `@Exclude()` de `class-transformer` en entidades para ocultar campos sensibles (contraseñas, tokens internos).
- Aplicar `ClassSerializerInterceptor` globalmente.
- **Nunca** retornar la entidad directamente desde el controlador sin serialización.

```typescript
// En la entidad
@Exclude()
password: string;

// En el controlador — habilitar serialización
@UseInterceptors(ClassSerializerInterceptor)
findOne(@Param('id') id: string): Promise<User> { ... }
```

---

## 10. Rendimiento y Optimización de Base de Datos

### Evitar Problema N+1

```typescript
// PROHIBIDO — N+1 queries (1 query para users + N queries para orders)
const users = await this.userRepo.find();
for (const user of users) {
  user.orders = await this.orderRepo.find({ where: { userId: user.id } });
}

// CORRECTO — Eager loading con relations (1 query con JOIN)
const users = await this.userRepo.find({ relations: ['orders'] });

// CORRECTO — QueryBuilder con JOIN explícito y filtros
const users = await this.userRepo
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.orders', 'order')
  .where('user.isActive = :isActive', { isActive: true })
  .getMany();
```

### Índices en Columnas Consultadas

Agregar `@Index()` en columnas frecuentemente usadas en cláusulas `WHERE`, `ORDER BY` o `JOIN`:

```typescript
@Entity()
export class User {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  @Index()
  tenantId: number;
}
```

### Select Selectivo

No traer todas las columnas cuando no son necesarias:

```typescript
// Solo columnas necesarias
await this.userRepo.find({ select: ['id', 'email', 'name'] });
```

### Paginación Obligatoria en Listados

Todo endpoint que retorne una lista de recursos **debe** implementar paginación. Nunca retornar todos los registros sin límite:

```typescript
// Patrón de paginación estándar
async findAll(page: number = 1, limit: number = 20): Promise<[User[], number]> {
  return this.repo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

---

## 11. Tipado Estricto

### Reglas Absolutas

| Regla | Descripción |
|-------|-------------|
| **Cero `any`** | Prohibido en firmas de métodos, propiedades y variables del código productivo. Usar `unknown`, tipos genéricos o tipos específicos. |
| **Retornos Explícitos** | Todos los métodos de controllers y services deben declarar su tipo de retorno: `Promise<User>`, `Promise<void>`, etc. |
| **Interfaces para Contratos** | Payloads de JWT, eventos y configuraciones deben tener interfaces explícitas. |
| **`strict: true` en tsconfig** | El compilador TypeScript debe operar en modo estricto. |

```typescript
// PROHIBIDO
async findUser(id: any): Promise<any> { ... }
const result: any = await this.service.doSomething();

// CORRECTO
async findUser(id: number): Promise<User | null> { ... }
const result: UserResponseDto = await this.service.doSomething();
```

---

## 12. Logging y Observabilidad

### Usar NestJS Logger — Nunca `console.log`

```typescript
// CORRECTO
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async createUser(dto: CreateUserDto): Promise<User> {
    this.logger.log('Creating user', { email: dto.email });
    try {
      const user = await this.usersRepository.save(dto);
      this.logger.log('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error.stack, { email: dto.email });
      throw error;
    }
  }
}

// PROHIBIDO
console.log('User created:', user); // Sin contexto ni niveles
console.log('Error:', error);       // Usar logger.error() con stack trace
```

### Reglas de Logging

- **Nunca** loguear datos sensibles: contraseñas, tokens, números de tarjeta.
- Usar el nivel correcto:
  - `log` → info operacional normal
  - `debug` → información detallada para desarrollo
  - `warn` → situaciones inesperadas pero recuperables
  - `error` → fallas que necesitan atención con stack trace
- Incluir contexto relevante: `userId`, `tenantId`, operación, resource ID.
- En producción, configurar logs en formato JSON estructurado.

---

## 13. Configuración de Entorno

### `@nestjs/config` con Validación — Obligatorio

```typescript
// PROHIBIDO — Acceso directo a process.env en servicios
const dbHost = process.env.DB_HOST; // Sin validación, puede ser undefined

// CORRECTO — Configuración validada en bootstrap con Joi
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, appConfig],
  validationSchema: Joi.object({
    NODE_ENV:     Joi.string().valid('development', 'production', 'test').required(),
    PORT:         Joi.number().default(3000),
    DB_HOST:      Joi.string().required(),
    DB_PORT:      Joi.number().default(5432),
    DB_USERNAME:  Joi.string().required(),
    DB_PASSWORD:  Joi.string().required(),
    DB_NAME:      Joi.string().required(),
    JWT_SECRET:   Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().required(),
  }),
});
```

### Variables de Entorno Requeridas

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `NODE_ENV` | `string` | Entorno de ejecución (`development`, `production`, `test`) |
| `PORT` | `number` | Puerto del servidor HTTP |
| `DB_HOST` | `string` | Host de PostgreSQL |
| `DB_PORT` | `number` | Puerto de PostgreSQL (default: 5432) |
| `DB_USERNAME` | `string` | Usuario de base de datos |
| `DB_PASSWORD` | `string` | Contraseña de base de datos |
| `DB_NAME` | `string` | Nombre de la base de datos |
| `JWT_SECRET` | `string` | Secreto JWT (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | `string` | Expiración del access token (ej: `15m`) |

> **Importante**: Nunca commitear el archivo `.env` al repositorio. Usar `.env.example` como plantilla con valores de placeholder.

---

## 14. Testing

### Estándar de Cobertura

> **Mínimo requerido: 80%** de cobertura en statements, branches, functions y lines.
> Verificar con: `npm run test:cov`

### Estructura de Tests Unitarios

- Los archivos de test deben estar **junto al archivo que testean**: `users.service.spec.ts` junto a `users.service.ts`.
- Usar `Test.createTestingModule()` de NestJS para el setup.
- **Mockear todas las dependencias externas**: repositorios, servicios externos, `EventEmitter2`.
- Un describe por clase, un it por caso de uso (happy path + error paths).

```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<IUsersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(USER_REPOSITORY);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.save.mockResolvedValue(mockUser);
      const result = await service.createUser(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      usersRepository.findByEmail.mockResolvedValue(existingUser);
      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });
});
```

### Tests E2E

- Usar `Supertest` para tests de integración end-to-end.
- Ubicar en la carpeta `test/` en la raíz del proyecto.
- Testear el contrato HTTP completo: status codes, headers, body de respuesta.

### Migraciones de Base de Datos

- **Nunca** modificar migraciones existentes. Siempre crear una nueva.
- Generar migraciones con: `npm run migration:generate -- --name=NombreDescriptivo`.
- Revisar el SQL generado antes de ejecutarlo en staging/producción.

---

## 15. Documentación de API

### Swagger/OpenAPI Completo

Todos los endpoints deben estar documentados:

```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> { ... }
}
```

### DTOs de Respuesta Separados

Los DTOs de entrada (`CreateUserDto`, `UpdateUserDto`) no deben usarse como tipo de respuesta. Crear DTOs de respuesta separados que controlen qué datos se exponen al cliente:

```typescript
// dto/user-response.dto.ts
export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@vyma.com' })
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  // Sin password, sin tokens internos, sin campos de auditoría interna
}
```

---

## 16. Directivas para Agentes de IA

Este apartado contiene las directrices de acción de **obligatorio cumplimiento** para todo agente de IA que opere en este repositorio.

---

### Rol: Tech Lead (Creador de RFC)

- **Planificación Estructurada**: Al diseñar un nuevo endpoint o feature, mapear en el RFC **todos los archivos** a crear con su ruta exacta dentro de la estructura modular de la Sección 2.
- **Contratos Previos**: Definir en el RFC las interfaces de entrada (DTOs) y salida (DTOs de respuesta) antes de delegar al agente desarrollador.
- **Revisión de Dependencias**: Identificar si el nuevo módulo puede generar dependencias circulares y proponer la solución EDA si es necesario.
- **Identificar Eventos**: Si la feature dispara efectos secundarios (notificaciones, auditorías, webhooks), diseñar el evento de dominio y el listener correspondiente.
- **Carga Dinámica de Contexto**: No cargar el archivo `AGENTS.md` completo. Cargar solo las reglas individuales relevantes para la tarea en curso.

---

### Rol: Desarrollador Senior

- **Alineación de Carpetas**: No crear subcarpetas, convenciones o nombres de archivo fuera de los especificados en la Sección 2. Ante duda, consultar este documento.
- **Separación de Responsabilidades**: Crear siempre archivos separados para Controller, Service, Repository, DTO y Exception. **Nunca mezclar responsabilidades en un único archivo**.
- **Decoración de Validación Completa**: Añadir decorador de `class-validator` a **cada propiedad** de un DTO. Sin excepciones.
- **Documentación Swagger Completa**: Añadir `@ApiProperty()` a **cada propiedad** de un DTO de entrada o salida.
- **No `any`**: Antes de finalizar el trabajo, verificar que ningún archivo creado o modificado contenga el tipo `any`.
- **Tests Obligatorios**: Todo Service y Repository nuevo debe tener su archivo `.spec.ts` con cobertura del happy path y los casos de error principales.
- **Flujo de Errores Explícito**: Todo método asíncrono que interactúe con BD o servicios externos debe tener manejo de errores con `try/catch` y lanzar la excepción HTTP correcta.
- **Análisis por Módulos**: Si los archivos a analizar superan 300 líneas en total, analizarlos de forma incremental por módulo funcional para evitar pérdida de contexto.

---

### Rol: Code Reviewer (Tech Lead de Control)

- **Inspección de `any`**: Revisar meticulosamente todos los archivos modificados para garantizar ausencia total de `any` en código productivo.
- **Inspección de Excepciones**: Verificar que todas las respuestas de error usen excepciones controladas de NestJS. Ningún error crudo de BD o del runtime debe llegar al cliente.
- **Auditoría de Nomenclatura**: Verificar que archivos y clases cumplan con la tabla de casing y sufijos de la Sección 3.
- **Auditoría de Estructura**: Verificar que los nuevos archivos estén en las carpetas correctas según la Sección 2.
- **Auditoría de Guards**: Verificar que todos los endpoints sensibles tengan `@UseGuards()` o tengan `@Public()` declarado explícitamente.
- **Auditoría de DTOs**: Verificar que cada propiedad de cada DTO tenga su decorador de validación y su `@ApiProperty()`.
- **Auditoría de Tests**: Verificar que existan archivos `.spec.ts` para los servicios y repositorios nuevos o modificados.
- **Auditoría de N+1**: Revisar las consultas en los repositorios para detectar posibles N+1 queries y proponer la solución con `relations` o `QueryBuilder`.

---

## Apéndice: Checklist de Pull Request

Antes de aprobar cualquier Pull Request, verificar que todos los puntos apliquen:

```
ESTRUCTURA Y NOMENCLATURA
  [ ] Los nuevos archivos siguen la estructura de carpetas (Sección 2)
  [ ] Los nombres de archivos y clases cumplen con sufijos y casing (Sección 3)
  [ ] No se crearon carpetas fuera de la estructura establecida

ARQUITECTURA
  [ ] Los Controllers no contienen lógica de negocio
  [ ] Los Services no inyectan Repository<Entity> ni DataSource directamente
  [ ] El flujo es estrictamente: Controller → Service → Repository
  [ ] Las dependencias circulares se resuelven mediante eventos (EDA)

VALIDACIÓN Y DTOS
  [ ] Todos los endpoints tienen DTOs validados (sin any, sin object crudo)
  [ ] Cada propiedad del DTO tiene decorador de class-validator
  [ ] Cada propiedad del DTO tiene @ApiProperty() con descripción y ejemplo

SEGURIDAD
  [ ] Los endpoints sensibles tienen @UseGuards()
  [ ] Los endpoints públicos tienen @Public() declarado explícitamente
  [ ] No hay datos sensibles (passwords, tokens) en los logs
  [ ] Los endpoints de autenticación tienen rate limiting configurado

TIPOS
  [ ] Ausencia total de any en el código productivo
  [ ] Todos los métodos de Controller y Service tienen tipo de retorno explícito

MANEJO DE ERRORES
  [ ] Se usan excepciones HTTP de NestJS (no new Error())
  [ ] Los errores de BD están mapeados a la excepción HTTP correcta
  [ ] Los métodos async tienen try/catch cuando interactúan con BD o servicios externos
  [ ] Las excepciones de negocio están en archivos separados dentro de exceptions/

RENDIMIENTO
  [ ] No hay N+1 queries en los repositorios
  [ ] Los endpoints de listado tienen paginación
  [ ] Las columnas consultadas frecuentemente tienen @Index()

TESTING
  [ ] Existe archivo .spec.ts para el Service y Repository nuevos o modificados
  [ ] La cobertura total no baja del 80%
  [ ] Se testean los casos de error además del happy path

DOCUMENTACIÓN
  [ ] Los endpoints están documentados con @ApiTags(), @ApiOperation() y @ApiResponse()
  [ ] Los DTOs de respuesta están separados de los DTOs de entrada
```

---

*Última actualización: 2026-06-15 — Vyma Backend Team*
