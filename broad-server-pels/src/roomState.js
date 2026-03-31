/**
 * In-memory room state store for sync (movePage / setForm).
 * Room별로 broadcast된 movePage·setForm의 최종 상태를 저장하고,
 * 새로 입장한 클라이언트에게만 roomState 메시지로 전달할 때 사용한다.
 * 기존 릴레이/브로드캐스트 로직에는 관여하지 않는다.
 */
import { logger } from './logger.js';

/**
 * @type {Map<string, {
 *   lastPage?: number,
 *   formValuesByKey: Record<string, { formId: string, page: number, value: string, type?: string|null, raw?: any }>,
 *   drawingByPage: Record<number, any[]>
 * }>}
 */
const roomStateByRoom = new Map();

/**
 * broadcast 메시지가 movePage 또는 setForm일 때 해당 Room 상태를 갱신한다.
 * @param {string} roomId
 * @param {object} data - 파싱된 broadcast 메시지 (data.type === 'broadcast', data.value.event)
 */
export function updateRoomState(roomId, data) {
    if (!roomId || data?.type !== 'broadcast' || !data?.value) return;

    const event = data.value.event;
    // movePage: Room별 마지막 페이지 번호 저장 (신규 입장자 초기 페이지용)
    if (event === 'movePage') {
        const page = data.value.page != null ? Number(data.value.page) : undefined;
        if (page == null || Number.isNaN(page)) return;
        let state = roomStateByRoom.get(roomId);
        if (!state) {
            state = { formValuesByKey: {}, drawingByPage: {} };
            roomStateByRoom.set(roomId, state);
        }
        state.lastPage = page;
        logger.debug('roomState.updated.movePage', { roomId, page });
        return;
    }
    // setForm: 폼 컨트롤별 값 저장 (formId+page를 키로, raw는 전체 payload 전달용)
    if (event === 'setForm') {
        const formId = data.value.formId;
        const value = data.value.value;
        const page = data.value.page != null ? Number(data.value.page) : 1;
        const ctrlType = data.value.type != null ? String(data.value.type) : null;
        if (!formId) return;
        let state = roomStateByRoom.get(roomId);
        if (!state) {
            state = { formValuesByKey: {}, drawingByPage: {} };
            roomStateByRoom.set(roomId, state);
        }

        if (String(ctrlType || '').toLowerCase() === 'drawing' || String(formId).toLowerCase() === 'drawing') {
            // value는 string(json) 또는 object일 수 있음
            let obj = null;
            try {
                obj = typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
                obj = null;
            }

            const strokes =
                Array.isArray(obj?.paths) ? obj.paths :
                    (obj && Array.isArray(obj.points)) ? [obj] :
                        Array.isArray(obj) ? obj :
                            [];

            const isPointsEmptyStroke =
                (obj && Array.isArray(obj.points) && obj.points.length === 0);

            const hasStrokeId =
                (obj && obj.id != null && String(obj.id) !== '');

            const isClearAll =
                (obj && Array.isArray(obj.paths) && obj.paths.length === 0) ||
                (isPointsEmptyStroke && !hasStrokeId);

            //  전체 clear
            if (isClearAll) {
                state.drawingByPage[page] = [];
                logger.debug('roomState.updated.drawing.clearAll', { roomId, page });
                return;
            }

            //  특정 stroke 삭제 (points:[] + id 있음)
            if (isPointsEmptyStroke && hasStrokeId) {
                const delId = String(obj.id);
                const cur = state.drawingByPage[page] || [];
                state.drawingByPage[page] = cur.filter(s => String(s?.id ?? '') !== delId);
                logger.debug('roomState.updated.drawing.deleteOne', { roomId, page, delId });
                return;
            }

            if (strokes.length > 0) {
                const cur = state.drawingByPage[page] || [];
                // id 기준으로 중복 제거(같은 stroke 재수신 방지)
                const seen = new Set(cur.map(s => String(s?.id ?? '')));

                for (const s of strokes) {
                    const id = String(s?.id ?? '');
                    if (id && seen.has(id)) continue;
                    cur.push(s);
                    if (id) seen.add(id);
                }

                state.drawingByPage[page] = cur;
                logger.debug('roomState.updated.drawing.append', {
                    roomId, page, add: strokes.length, total: cur.length,
                });
            }

            return;
        }

        const key = `${formId}_${page}`;
        // raw에는 브로드캐스트 value 전체(추가 payload 포함)를 그대로 담아 신규 입장자에게 전달한다.
        // (deltaBinary 적용 전까지 drawingPath 등 full payload 전달 목적)
        state.formValuesByKey[key] = {
            formId,
            page,
            value: value ?? '',
            type: ctrlType,
            raw: data.value,
        };
        logger.debug('roomState.updated.setForm', { roomId, formId, page, ctrlType });
    }
}

/**
 * Room의 저장된 상태를 새 접속자에게 보낼 수 있는 형태로 반환한다.
 * @param {string} roomId
 * @returns {{ roomId: string, lastPage?: number, formValues: Array<{ formId: string, page: number, value: string, type?: string|null, raw?: any }> } | null}
 */
export function getRoomState(roomId) {
    const state = roomStateByRoom.get(roomId);
    if (!state) return null;

    const formValues = Object.values(state.formValuesByKey);

    if (state.drawingByPage) {
        for (const [pageStr, strokes] of Object.entries(state.drawingByPage)) {
            const page = Number(pageStr);
            if (!page || Number.isNaN(page)) continue;

            const paths = Array.isArray(strokes) ? strokes : [];
            formValues.push({
                formId: 'drawing',
                page,
                type: 'drawing',
                value: JSON.stringify({ paths }),
                raw: { formId: 'drawing', page, type: 'drawing', value: { paths } },
            });
        }
    }

    if (state.lastPage == null && formValues.length === 0) return null;

    const payload = {
        roomId,
        formValues,
    };
    if (state.lastPage != null) payload.lastPage = state.lastPage;
    return payload;
}

/**
 * Room이 삭제될 때 해당 Room의 저장 상태를 제거한다.
 * @param {string} roomId
 */
export function clearRoomState(roomId) {
    if (!roomId) return;
    if (roomStateByRoom.has(roomId)) {
        roomStateByRoom.delete(roomId);
        logger.debug('roomState.cleared', { roomId });
    }
}
