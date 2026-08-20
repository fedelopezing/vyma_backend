import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres', // Cambia a tu motor de base de datos (mysql, sqlite, etc.)
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vyma',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'fede@123',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')], // Soporta src (dev) y dist (prod)
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')], // Soporta src (dev) y dist (prod)
  synchronize: false, // Desactiva en producción para evitar cambios automáticos
  logging: true,
});
