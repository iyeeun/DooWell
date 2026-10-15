import type { Request, RequestHandler, Response } from 'express';
import { createNestApp } from '../apps/backend/src/bootstrap';

let handlerPromise: Promise<RequestHandler> | undefined;

function restoreOriginalApiPath(request: Request) {
  const url = new URL(request.url, 'http://localhost');
  const rewrittenPath = url.searchParams.get('__path');

  if (rewrittenPath === null) return;

  url.searchParams.delete('__path');
  const search = url.searchParams.toString();
  request.url = `/api/${rewrittenPath}${search ? `?${search}` : ''}`;
}

async function getHandler(): Promise<RequestHandler> {
  if (!handlerPromise) {
    handlerPromise = createNestApp()
      .then(async (app) => {
        await app.init();
        return app.getHttpAdapter().getInstance() as RequestHandler;
      })
      .catch((error: unknown) => {
        handlerPromise = undefined;
        throw error;
      });
  }

  return handlerPromise;
}

export default async function handler(request: Request, response: Response): Promise<void> {
  restoreOriginalApiPath(request);
  const nestHandler = await getHandler();
  nestHandler(request, response, () => undefined);
}
