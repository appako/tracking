import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { useEffect, useMemo } from 'react';
import { DeepPartial, DefaultValues, FieldValues, Resolver, UseFormProps, useForm } from 'react-hook-form';

export function useModelForm<TModel extends ClassConstructor<T>, T extends FieldValues, TContext>(
    Model: TModel,
    initValues?: DeepPartial<InstanceType<TModel>>,
    props?: UseFormProps<InstanceType<TModel>, TContext>,
) {
    const resolver = classValidatorResolver(Model) as unknown as Resolver<InstanceType<TModel>>;

    const defaultValues = useMemo(
        () => (initValues ? plainToModel(Model, initValues) : undefined),
        [Model, initValues],
    ) as DefaultValues<InstanceType<TModel>>;

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

export function plainToModel<TClass extends ClassConstructor<object>, V>(
    cls: TClass,
    plain: V[],
    options?: ClassTransformOptions,
): InstanceType<TClass>[];
export function plainToModel<TClass extends ClassConstructor<object>, V>(
    cls: TClass,
    plain: V,
    options?: ClassTransformOptions,
): InstanceType<TClass>;
export function plainToModel(cls: ClassConstructor<unknown>, plain: unknown, options?: ClassTransformOptions) {
    return plainToInstance(cls, plain, {
        exposeDefaultValues: true,
        enableCircularCheck: true,
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
        exposeUnsetFields: false,
        ...options,
    });
}
