import 'isomorphic-fetch';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createAccessRequest } from './src/walletProviderService.mjs';
import fetch, { Headers } from 'node-fetch';

global.Headers = Headers;

config({ path: '.env.local' });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/access-request', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { resourceOwner, resources } = req.body;
    const result = await createAccessRequest(resourceOwner, resources);
    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});