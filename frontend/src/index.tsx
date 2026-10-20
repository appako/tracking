import 'reflect-metadata';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { configure } from 'mobx';
import ReactDOM from 'react-dom/client';
import { queryClient } from './api/query.client';
import { App } from './app';
import { AppContainerProvider } from './services/service.base';
import { theme } from './theme';

configure({ enforceActions: 'always', useProxies: 'never' });

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <AppContainerProvider>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </AppContainerProvider>,
);
