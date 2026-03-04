import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface IPInfo {
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

const getIPInfo = async (ip: string): Promise<IPInfo | null> => {
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
    if (data.status === 'fail') return null;

    return {
      ip,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
    };
  } catch {
    return null;
  }
};

export const ipInfoMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    let ip =
      forwardedFor?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      req.ip;

    // Local development
    if (ip === '::1' || ip === '127.0.0.1') {
      const { data } = await axios.get('https://api.ipify.org?format=json');
      ip = data.ip;
    }

    // IPv6 mapped IPv4
    if (ip?.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    console.log(`[IP Middleware] User IP: ${ip}`);

    req.ipInfo = await getIPInfo(ip!);
  } catch (error) {
    console.error('[IP Middleware] Error:', error);
    req.ipInfo = null;
  }

  next();
};

// location / {
//     proxy_pass http://localhost:5000;
//     proxy_set_header X-Forwarded-For $remote_addr;  # ✅ Real IP send
//     proxy_set_header X-Real-IP $remote_addr;
//     proxy_set_header Host $host;
// }
