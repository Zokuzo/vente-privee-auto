import { writeFileSync } from 'fs';
import { config } from 'dotenv';

config();

const {
  EMAILJS_PUBLIC_KEY  = '',
  EMAILJS_SERVICE_ID  = '',
  EMAILJS_TEMPLATE_ID = '',
} = process.env;

writeFileSync(
  'config.js',
  `window.EMAILJS_PUBLIC_KEY="${EMAILJS_PUBLIC_KEY}";\n` +
  `window.EMAILJS_SERVICE_ID="${EMAILJS_SERVICE_ID}";\n` +
  `window.EMAILJS_TEMPLATE_ID="${EMAILJS_TEMPLATE_ID}";\n`
);

console.log('config.js généré.');
