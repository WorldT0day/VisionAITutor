import fs from 'fs';
import dotenv from 'dotenv';
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
  console.log(k, "=>", envConfig[k]);
}
