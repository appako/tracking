import { CSSProperties } from '@mui/styled-engine';
import { Box as MuiBox, BoxProps as MuiBoxProps } from '@mui/system';
import { useMemo } from 'react';

export interface BoxProps extends MuiBoxProps {
    overflowX?: CSSProperties['overflowX'];
}

export function Flex(props: BoxProps) {
    const sx = useMemo(() => ({ ...props.sx, overflowX: props.overflowX }), [props.sx, props.overflowX]);
    return <MuiBox display="flex" flexDirection="column" justifyContent="center" {...props} sx={sx}></MuiBox>;
}

export function Col(props: BoxProps) {
    return <Flex display="flex" flexDirection="column" justifyContent="center" {...props}></Flex>;
}

export function Row(props: BoxProps) {
    return <Flex display="flex" flexDirection="row" alignItems="center" {...props}></Flex>;
}
