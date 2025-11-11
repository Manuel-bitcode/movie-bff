interface Config {
  port: number;
  env: string;
  apiKey: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3004', 10),
  env: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY || '',
};

export default config;

