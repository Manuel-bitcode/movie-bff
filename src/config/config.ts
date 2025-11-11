interface Config {
  port: number;
  env: string;
  apiKey: string;
  OMDB_API_KEY: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3004', 10),
  env: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY || '',
  OMDB_API_KEY: process.env.OMDB_API_KEY || '',
};

export default config;

