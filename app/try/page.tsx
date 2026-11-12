import type { Metadata } from 'next';
import { GuestPlayground } from '@/components/guest-playground';

export const metadata: Metadata = {
  title: 'Try WaleWorks AI — No account needed',
  description: 'Explore career directions, try a short workplace scenario and preview a student project portfolio before creating an account.',
};

export default function TryPage() {
  return <GuestPlayground />;
}
