// import 'express';

// export interface ILocationInfo {
//   country?: string;
//   region?: string;
//   city?: string;
//   latitude?: number;
//   longitude?: number;
//   timezone?: string;
//   isp?: string;
// }

// export interface IClientInfo {
//   device: string;
//   browser: string;
//   browserVersion?: string;
//   ipAddress: string;
//   pcName?: string;
//   os: string;
//   osVersion?: string;
//   userAgent: string;
//   deviceModel?: string;
//   cpuArchitecture?: string;
//   location?: ILocationInfo;
// }

// export interface IIPInfo {
//   ip: string;
//   country: string;
//   countryCode: string;
//   region: string;
//   city: string;
//   zip: string;
//   lat: number;
//   lon: number;
//   timezone: string;
//   isp: string;
// }

// declare module 'express' {
//   interface Request {
//     ipInfo?: IIPInfo | null;
//     clientInfo?: IClientInfo | null;
//   }
// }

import { IClientInfo, IIPInfo } from './clientInfo';

declare global {
  namespace Express {
    interface Request {
      clientInfo?: IClientInfo | null;
      ipInfo?: IIPInfo | null;
    }
  }
}

export {};