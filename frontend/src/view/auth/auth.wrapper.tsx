import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '~/routes';
import { AuthService } from '~/services/service.auth';
import { useService } from '~/services/service.base';

export const AuthWrapper = observer(() => {
    const [auth] = useService(AuthService);

    if (!auth.isAuthenticated) return <Navigate to={ROUTES.LOGIN.$path()} replace />;
    else return <Outlet />;
});
