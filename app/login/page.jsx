import { listActiveStaff } from '@/app/actions/staff';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const staff = await listActiveStaff();
  return <LoginClient staff={staff} />;
}
