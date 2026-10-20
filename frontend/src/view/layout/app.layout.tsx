import { AppBar, Box, Button, CircularProgress, Container, Toolbar, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { FC, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthService } from '~/services/service.auth';
import { useService } from '~/services/service.base';

const pageLoader = (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
    </Box>
);

export const AppLayout: FC = observer(() => {
    const [year] = useState(new Date().getFullYear());
    const [auth] = useService(AuthService);

    auth.useVerify();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Object Tracking
                    </Typography>
                    {auth.isAuthenticated && (
                        <Button color="inherit" onClick={auth.logout}>
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1 }}>
                <Container maxWidth="xl">
                    {auth.status === 'verifying' ? (
                        pageLoader
                    ) : (
                        <Suspense fallback={pageLoader}>
                            <Outlet />
                        </Suspense>
                    )}
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{
                    mt: 'auto',
                    py: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    height: 56,
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {year} Object Tracking App
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
});
