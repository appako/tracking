import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEventHandler, useCallback } from 'react';
import { Control, FieldPath, FieldValues, useController, useFormContext, useWatch } from 'react-hook-form';

export function TextFieldRhf<
    TFieldValues extends FieldValues = FieldValues,
    TContext = unknown,
    TTransformedValues = TFieldValues,
>(
    props: {
        name: FieldPath<TFieldValues>;
        control: Control<TFieldValues, TContext, TTransformedValues>;
    } & TextFieldProps,
) {
    const { name, control, helperText } = props;
    const {
        field,
        fieldState: { error },
    } = useController({ control, name });
    const { clearErrors } = useFormContext();
    const value = useWatch({ control, name });

    const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            const value = e.target.value;
            if (error) clearErrors(field.name);
            field.onChange({ target: { name: field.name, value } });
        },
        [clearErrors, error, field],
    );

    return (
        <TextField
            {...props}
            value={value || ''}
            onChange={handleChange}
            error={Boolean(error)}
            helperText={error?.message || helperText}
        />
    );
}
