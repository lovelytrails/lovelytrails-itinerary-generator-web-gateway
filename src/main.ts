import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloGateway } from '@apollo/gateway';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

async function bootstrap() {
  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'itinerary-generator', url: process.env.ITINERARY_SERVICE_URL },
    ],
  });

  const server = new ApolloServer({
    gateway,
    introspection: true,
  });

  await server.start();

  app.use(cors());
  app.use(express.json()); // ✅ parse JSON bodies

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    app.listen(4000, () => {
      console.log('🚀 Gateway running at http://localhost:4000/graphql');
    });
  }
}

bootstrap();

// ✅ Export Express app for Vercel
export default app;