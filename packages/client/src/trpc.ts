import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@gander-studio/server';

export const trpc = createTRPCReact<AppRouter>();
