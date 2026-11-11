import AdminClient from './AdminClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FMKAL Admin Portal | Vehicle Contact',
  description: 'Administration panel for FMKAL Vehicle Contact System',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
