import { Suspense } from 'react';
import { useNavigate } from 'react-router';

import { NeighborhoodSelectForm } from '@/features/select-neighborhood';

export default function NeighborhoodPage() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate('/map');
  };

  return (
    <main>
      <h1>동네 고르기</h1>
      <Suspense>
        <NeighborhoodSelectForm onConfirm={handleConfirm} />
      </Suspense>
    </main>
  );
}
