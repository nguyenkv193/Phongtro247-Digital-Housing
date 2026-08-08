'use client';

import CreateListingForm from '@/features/landlord/pages/CreateListingForm';
import { useNavigate } from '@/lib/navigation/router-compat';

export default function Page() {
    const navigate = useNavigate();
    return (
        <CreateListingForm
            type="nhà trọ/phòng trọ"
            onBack={() => navigate('/landlord-dashboard')}
        />
    );
}



