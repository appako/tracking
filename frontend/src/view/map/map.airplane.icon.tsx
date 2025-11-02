import React from 'react';
import ReactDOMServer from 'react-dom/server';

interface AirplaneIconProps {
    direction: number;
    name: string;
    color?: string;
    backgroundColor?: string;
}

const AirplaneIconWithStyles: React.FC<AirplaneIconProps> = ({
    direction,
    name,
    color = '#2196f3',
    backgroundColor = '#ffffff',
}) => {
    const nameWidth = Math.max(40, name.length * 8);

    return (
        <div style={{ position: 'relative' }}>
            <div
                style={{
                    width: 50,
                    height: 50,
                    background: color,
                    border: `3px solid ${backgroundColor}`,
                    borderRadius: '50% 50% 50% 0',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${direction - 90}deg)`,
                        color: 'white',
                        fontSize: 28,
                        fontWeight: 'bold',
                        lineHeight: 1,
                    }}
                >
                    ✈
                </div>
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `${color}e6`,
                    color: 'white',
                    width: nameWidth,
                    textAlign: 'center',
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    border: `1px solid ${backgroundColor}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    display: 'inline-block',
                    minHeight: 14,
                    lineHeight: '14px',
                    padding: '0 4px',
                }}
            >
                {name}
            </div>
        </div>
    );
};

export const createAirplaneIconHtml = ({
    direction,
    name,
    color = '#2196f3',
    backgroundColor = '#ffffff',
}: AirplaneIconProps) => {
    return ReactDOMServer.renderToString(
        <AirplaneIconWithStyles direction={direction} name={name} color={color} backgroundColor={backgroundColor} />,
    );
};
