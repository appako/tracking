export const AIRPLANE_ROTOR_CLASS = 'airplane-rotor';

const COLOR = '#2196f3';
const BORDER_COLOR = '#ffffff';

export const createAirplaneIconHtml = (name: string) => {
    const nameWidth = Math.max(40, name.length * 8);

    return `<div style="position: relative">
        <div style="
            width: 50px;
            height: 50px;
            background: ${COLOR};
            border: 3px solid ${BORDER_COLOR};
            border-radius: 50% 50% 50% 0;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            position: relative;
        ">
            <div class="${AIRPLANE_ROTOR_CLASS}" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 28px;
                font-weight: bold;
                line-height: 1;
            ">✈</div>
        </div>
        <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${COLOR}e6;
            color: white;
            width: ${nameWidth}px;
            text-align: center;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            border: 1px solid ${BORDER_COLOR};
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            display: inline-block;
            min-height: 14px;
            line-height: 14px;
            padding: 0 4px;
        ">${name}</div>
    </div>`;
};

export const rotateAirplaneIcon = (element: HTMLElement | undefined, direction: number) => {
    const rotor = element?.querySelector<HTMLElement>(`.${AIRPLANE_ROTOR_CLASS}`);
    if (rotor) rotor.style.transform = `translate(-50%, -50%) rotate(${direction - 90}deg)`;
};
