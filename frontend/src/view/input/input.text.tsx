import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEventHandler, useCallback } from 'react';
import { Control, FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';

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
    const { name, control, helperText, ...textFieldProps } = props;
    const {
        field,
        fieldState: { error },
    } = useController({ control, name });
    const { clearErrors } = useFormContext();

    const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (error) clearErrors(field.name);
            field.onChange(e.target.value);
        },
        [clearErrors, error, field],
    );

    return (
        <TextField
            {...textFieldProps}
            name={field.name}
            inputRef={field.ref}
            value={field.value ?? ''}
            onChange={handleChange}
            onBlur={field.onBlur}
            error={Boolean(error)}
            helperText={error?.message || helperText}
        />
    );
}
