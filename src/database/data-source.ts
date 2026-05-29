import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres', // Cambia a tu motor de base de datos (mysql, sqlite, etc.)
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'harmonia',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'fede@123',
  entities: [join(process.cwd(), 'src/**/*.entity.{ts,js}')], // Ruta relativa a las entidades
  migrations: [join(process.cwd(), 'src/database/migrations/*.{ts,js}')], // Ruta relativa a las migraciones
  synchronize: false, // Desactiva en producción para evitar cambios automáticos
  logging: true,
});
