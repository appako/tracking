import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router';
import { AuthService } from '~/services/service.auth';
import { useService } from '~/services/service.base';

export const AuthWrapper = observer(() => {
    const [auth] = useService(AuthService);

    if (!auth.isAuthenticated) return null;
    else return <Outlet />;
});
