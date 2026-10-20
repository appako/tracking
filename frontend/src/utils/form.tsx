import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ClassConstructor } from 'class-transformer';
import { useEffect } from 'react';
import { DeepPartial, DefaultValues, FieldValues, Resolver, UseFormProps, useForm } from 'react-hook-form';

export function useModelForm<TModel extends ClassConstructor<T>, T extends FieldValues, TContext>(
    Model: TModel,
    initValues?: DeepPartial<InstanceType<TModel>>,
    props?: UseFormProps<InstanceType<TModel>, TContext>,
) {
    const resolver = classValidatorResolver(Model) as unknown as Resolver<InstanceType<TModel>>;
    const defaultValues = initValues as DefaultValues<InstanceType<TModel>> | undefined;

    const form = useForm<InstanceType<TModel>, TContext>({
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        shouldFocusError: false,
        ...props,
        resolver,
        defaultValues,
    });

    useEffect(() => form.reset(defaultValues), [defaultValues, form]);

    return form;
}
