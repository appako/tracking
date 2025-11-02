import { DependencyList, useCallback } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export const useNavCallback = (cb: (nav: NavigateFunction) => void, deps: DependencyList) => {
    const navigate = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(() => cb(navigate), [navigate, ...deps]);
};
