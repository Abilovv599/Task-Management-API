# Task Management API - Development Guidelines

This document provides guidelines for developing and maintaining the Task Management API project.

## Build/Configuration Instructions

### Prerequisites
- Node.js v22.13.1 (managed via Volta)
- Yarn package manager
- PostgreSQL database

### Environment Setup
1. Create a `.env` file in the project root with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=task_management
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=3600
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Database setup:
   - The project uses TypeORM with PostgreSQL
   - You can use the provided docker-compose.yml to start a PostgreSQL instance:
     ```bash
     docker-compose up -d
     ```

### Running the Application
- Development mode: `yarn start:dev`
- Debug mode: `yarn start:debug`
- Production mode: `yarn build && yarn start:prod`

## Testing Information

### Test Configuration
The project uses Jest for testing. The configuration is in `jest.config.js` and includes:
- TypeScript support via ts-jest
- Path alias mapping for the `~/*` pattern
- Test files matching the pattern `*.spec.ts`

### Running Tests
- Run all tests: `yarn test`
- Run tests in watch mode: `yarn test:watch`
- Run tests with coverage: `yarn test:cov`
- Debug tests: `yarn test:debug`

### Writing Tests
Tests should be placed in the same directory as the file they're testing, with the `.spec.ts` extension.

#### Example: Testing a Service
Here's an example of testing the TasksService:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { TASK_STATUS } from '~/core/enums/task-status.enum';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';

// Mock the repository
const mockTasksRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  // Add other methods as needed
});

// Create a mock user
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  isTwoFactorEnabled: false,
  isOAuthUser: false,
  tasks: [],
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    // Set up the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      const mockTask = { id: 'task-id', title: 'Test Task' };
      tasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById('task-id', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(tasksService.getTaskById('task-id', mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

#### Testing Controllers
When testing controllers, you can use the `supertest` library with NestJS's `fastify` platform:

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  const tasksService = { getTasks: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET tasks', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect(tasksService.getTasks());
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Additional Development Information

### Project Structure
- `src/modules/` - Contains feature modules (tasks, auth, users)
- `src/core/` - Contains entities, enums, and other core components
- `src/common/` - Contains common models and utilities
- `src/interceptors/` - Contains interceptors for request/response handling
- `src/filter/` - Contains exception filters
- `src/middlewares/` - Contains middleware components
- `src/configs/` - Contains configuration files

### API Documentation
The API is documented using Swagger. When running in development mode, you can access the Swagger UI at:
```
http://localhost:3000/v1/api/docs
```

### Code Style
- The project uses ESLint and Prettier for code formatting
- Run `yarn lint` to check for linting issues
- Run `yarn format` to automatically format code
- Pre-commit hooks are set up with Husky to ensure code quality

### Authentication
- The project uses JWT for authentication
- Google OAuth is supported
- Two-factor authentication is available

### Database
- The project uses TypeORM with PostgreSQL
- Entity relationships:
  - User has many Tasks (one-to-many)
  - Task belongs to a User (many-to-one)

### Error Handling
- Global exception filter is used to handle all exceptions
- Responses are standardized using interceptors

### Caching
- The project uses NestJS's cache manager for caching
- Cache is configured globally
