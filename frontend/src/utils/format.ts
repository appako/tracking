export const formatCoordinate = (value: number, precision: number = 4) => {
    return value.toFixed(precision);
};

export const formatDirection = (direction: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(direction / 45) % 8;
    return `${direction.toFixed(4)}° ${directions[index]}`;
};

export const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
};
