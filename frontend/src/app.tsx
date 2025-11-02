import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '~/routes';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { MapPage } from './pages/map.page';
import { AuthWrapper } from './view/auth/auth.wrapper';
import { AppLayout } from './view/layout/app.layout';

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route path={ROUTES.ROOT.$path()} element={<HomePage />} />
                    <Route path={ROUTES.LOGIN.$path()} element={<LoginPage />} />
                    <Route element={<AuthWrapper />}>
                        <Route path={ROUTES.MAP.$path()} element={<MapPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
