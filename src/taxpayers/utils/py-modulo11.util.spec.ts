import {
  calculateParaguayDv,
  normalizeDocumentInput,
} from './py-modulo11.util';

describe('py-modulo11.util', () => {
  describe('calculateParaguayDv', () => {
    it('debería calcular correctamente el DV para RUCs conocidos', () => {
      expect(calculateParaguayDv('80012345')).toBe('0');
      expect(calculateParaguayDv('4123456')).toBe('1');
      expect(calculateParaguayDv('2005001')).toBe('1');
      expect(calculateParaguayDv('80000001')).toBe('3');
    });

    it('debería retornar 0 si el input no tiene números', () => {
      expect(calculateParaguayDv('ABC')).toBe('0');
      expect(calculateParaguayDv('')).toBe('0');
    });
  });

  describe('normalizeDocumentInput', () => {
    it('debería extraer la base y calcular el DV si el string no tiene guion', () => {
      const result = normalizeDocumentInput('80012345');
      expect(result.base).toBe('80012345');
      expect(result.dv).toBe('0');
    });

    it('debería extraer la base ignorando el DV ingresado por el usuario', () => {
      const result = normalizeDocumentInput('80012345-6');
      expect(result.base).toBe('80012345');
      expect(result.dv).toBe('0');

      // Si el usuario ingresa un DV incorrecto, el nuestro prevalece para ir al provider
      const wrongDvResult = normalizeDocumentInput('80012345-9');
      expect(wrongDvResult.base).toBe('80012345');
      expect(wrongDvResult.dv).toBe('0');
    });

    it('debería eliminar espacios en blanco', () => {
      const result = normalizeDocumentInput(' 80012345 - 6 ');
      expect(result.base).toBe('80012345');
      expect(result.dv).toBe('0');
    });
  });
});
