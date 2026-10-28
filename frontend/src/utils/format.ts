export const formatCoordinate = (value: number, precision: number = 4) => {
    return value.toFixed(precision);
};

export const formatDirection = (direction: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(direction / 45) % 8;
    return `${direction.toFixed(4)}° ${directions[index]}`;
};

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
};
