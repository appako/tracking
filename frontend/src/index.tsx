import 'reflect-metadata';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from 'mobx';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { AppContainerProvider } from './services/service.base';
import { theme } from './theme';

configure({ enforceActions: 'always', useProxies: 'never' });

const root = ReactDOM.createRoot(document.getElementById('root')!);

const queryClient = new QueryClient({});

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
