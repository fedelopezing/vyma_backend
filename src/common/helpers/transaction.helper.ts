import { DataSource, QueryRunner } from 'typeorm';

/**
 * Ejecuta un bloque de código dentro de una transacción de TypeORM,
 * gestionando automáticamente connect → startTransaction → commit/rollback → release.
 *
 * Elimina el boilerplate repetitivo de try/catch/finally en los Services.
 *
 * @param dataSource  DataSource inyectado en el Service
 * @param work        Función que recibe el QueryRunner y ejecuta las operaciones
 * @returns           El valor que retorne `work`
 *
 * @example
 * const result = await runInTransaction(this.dataSource, async (qr) => {
 *   const entity = qr.manager.create(MyEntity, data);
 *   return qr.manager.save(entity);
 * });
 */
export async function runInTransaction<T>(
  dataSource: DataSource,
  work: (qr: QueryRunner) => Promise<T>,
): Promise<T> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const result = await work(qr);
    await qr.commitTransaction();
    return result;
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
