import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { AuthLoginDto } from '~/dto/auth.dto';
import { AuthService } from '~/services/service.auth';
import { useService } from '~/services/service.base';
import { useModelForm } from '~/utils/form';
import { TextFieldRhf } from '~/view/input/input.text';

export const LoginPage = observer(() => {
    const [auth] = useService(AuthService);
    const form = useModelForm(AuthLoginDto);
    const handleError = useCallback((message?: string) => form.setError('apiKey', { message }), [form]);
    const { onSubmit } = auth.useLogin(handleError);

    const handleFormSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
        },
        [form, onSubmit],
    );

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
            }}
        >
            <Card sx={{ minWidth: 400, maxWidth: 500 }}>
                <CardContent sx={{ p: 4, gap: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Login
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Enter your API key to authenticate
                    </Typography>
                    <FormProvider {...form}>
                        <Box
                            component="form"
                            onSubmit={handleFormSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <TextFieldRhf control={form.control} name="apiKey" label="Api key" type="password" />
                            <Button type="submit">Login</Button>
                        </Box>
                    </FormProvider>
                </CardContent>
            </Card>
        </Box>
    );
});
