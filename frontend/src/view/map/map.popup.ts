import { ObjectDto } from '~/api/generated.schemas';
import { formatCoordinate, formatDirection, formatTime } from '~/utils/format';

export const createObjectPopupHtml = (object: ObjectDto) => `<div>
    <strong>${object.id.slice(-6)}</strong><br />
    <strong>Position:</strong><br />
    Lat: ${formatCoordinate(object.latitude)}<br />
    Lng: ${formatCoordinate(object.longitude)}<br />
    <strong>Direction:</strong> ${formatDirection(object.direction)}<br />
    <strong>Updated:</strong> ${formatTime(object.updatedAt)}
</div>`;
