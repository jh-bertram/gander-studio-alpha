import { useSessionStore } from '../../store/session-store';
import SessionListPage from './SessionListPage';
import SessionDetailPage from './SessionDetailPage';

export default function SessionsRouter() {
  const { selectedSessionId } = useSessionStore();

  if (selectedSessionId === null) {
    return <SessionListPage />;
  }
  return <SessionDetailPage />;
}
