import { AxiosInstance } from 'axios';
import { createContext, FC, PropsWithChildren, useContext, useState } from 'react';
import { C } from 'ts-toolbelt';
import { container, DependencyContainer } from 'tsyringe';

const Ctx = createContext<DependencyContainer>(null!);

export interface Injector {
    <T extends Svc, A extends [...Svc[]]>(svc1: T, ...svcs: [...A]): [InstanceType<T>, ...InstanceTypes<A>];
}

type Svc = C.Class<[...any], any>;

type InstanceTypes<Tuple extends [...Svc[]]> = {
    [Index in keyof Tuple]: Tuple[Index] extends Svc ? InstanceType<Tuple[Index]> : 'NOT_A_CLASS';
};

export const useService = ((...svcs: Svc[]) => {
    const app = useContext(Ctx);
    const rv = svcs.map(svc => app.resolve(svc));
    return rv;
}) as Injector;

export const AppContainerProvider: FC<PropsWithChildren> = ({ children }) => {
    return <Ctx.Provider value={container}>{children}</Ctx.Provider>;
};

export function useInjectable<T extends object>(cls: C.Class<[...any], T>): T {
    const app = useContext(Ctx);
    const [model] = useState(() => app.resolve(cls));
    return model;
}

export function HttpServiceBase<T extends object>(apiDecl: T): C.Class<[], T & { readonly axios: AxiosInstance }> {
    const base = class {
        constructor() {
            Object.assign(this, apiDecl);
        }
    };

    return base as any;
}
