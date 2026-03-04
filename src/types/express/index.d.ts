import 'express';

declare module 'express' {
  interface Request {
    ipInfo?: {
      ip: string;
      country: string;
      countryCode: string;
      region: string;
      city: string;
      zip: string;
      lat: number;
      lon: number;
      timezone: string;
      isp: string;
    } | null;
  }
}
