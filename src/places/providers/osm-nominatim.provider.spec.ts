import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import {
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OsmNominatimProvider } from './osm-nominatim.provider';

describe('OsmNominatimProvider', () => {
  let provider: OsmNominatimProvider;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OsmNominatimProvider,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<OsmNominatimProvider>(OsmNominatimProvider);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('search', () => {
    it('should return mapped places on success', async () => {
      const mockData = [
        {
          lat: '-25.2818961',
          lon: '-57.5684613',
          display_name: 'Shopping del Sol',
          address: {
            city: 'Asunción',
            state: 'Asunción',
            country: 'Paraguay',
          },
          type: 'hotel',
        },
      ];

      const axiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: { headers: {} as any },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await provider.search('Shopping del Sol', 1);

      expect(result).toEqual([
        {
          lat: -25.2818961,
          lon: -57.5684613,
          displayName: 'Shopping del Sol',
          city: 'Asunción',
          state: 'Asunción',
          country: 'Paraguay',
          type: 'hotel',
        },
      ]);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'Shopping del Sol',
            format: 'json',
            addressdetails: 1,
            countrycodes: 'py',
            limit: 1,
          },
          headers: {
            'User-Agent': 'VymaBackend/1.0 (info@puntocode.com.py)',
          },
        },
      );
    });

    it('should map town or village if city is not present', async () => {
      const mockData = [
        {
          lat: '-25.3',
          lon: '-57.6',
          display_name: 'Town Place',
          address: {
            town: 'Areguá',
          },
        },
        {
          lat: '-25.4',
          lon: '-57.7',
          display_name: 'Village Place',
          address: {
            village: 'Ypacaraí',
          },
        },
      ];

      const axiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: { headers: {} as any },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await provider.search('Town Place', 2);

      expect(result).toEqual([
        {
          lat: -25.3,
          lon: -57.6,
          displayName: 'Town Place',
          city: 'Areguá',
          state: undefined,
          country: undefined,
          type: undefined,
        },
        {
          lat: -25.4,
          lon: -57.7,
          displayName: 'Village Place',
          city: 'Ypacaraí',
          state: undefined,
          country: undefined,
          type: undefined,
        },
      ]);
    });

    it('should return empty array if data is empty or invalid', async () => {
      const axiosResponse = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: { headers: {} as any },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await provider.search('Invalid Place', 5);

      expect(result).toEqual([]);
    });

    it('should throw ServiceUnavailableException on http error', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Network Error')));

      await expect(provider.search('Shopping del Sol', 5)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('reverse', () => {
    it('should throw NotImplementedException when reverse is called', async () => {
      if (provider.reverse) {
        await expect(provider.reverse(-25.28, -57.56)).rejects.toThrow(
          NotImplementedException,
        );
      }
    });
  });
});
