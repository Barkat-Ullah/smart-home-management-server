export interface ILocationInfo {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

export interface IClientInfo {
  device: string;
  browser: string;
  browserVersion?: string;
  ipAddress: string;
  pcName?: string;
  os: string;
  osVersion?: string;
  userAgent: string;
  deviceModel?: string;
  cpuArchitecture?: string;
  location?: ILocationInfo;
}

export interface IIPInfo {
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
}
