import * as amplitude from '@amplitude/analytics-browser';
import { Identify } from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

amplitude.add(sessionReplayPlugin());

export function initAmplitude(apiKey) {
	amplitude.init(apiKey, undefined, {
		defaultTracking: false,
		trackingOptions: { pageViews: false },
	});
}

const SESSION_KEY = 'currentSessionId';

export function createNewSession() {
	try {
		const newId = (crypto?.randomUUID?.() || `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`).toLowerCase();
		localStorage.setItem(SESSION_KEY, JSON.stringify({ id: newId, startedAt: Date.now() }));
		return newId;
	} catch { return null; }
}

export function getCurrentSessionId() {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed?.id || null;
	} catch { return null; }
}

export function endSession() {
	try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function identifyUser({ userId, email, group }) {
	if (!userId && !email) return;
	if (userId) amplitude.setUserId(userId);
	const idObj = new Identify();
	if (email) idObj.set('email', email);
	if (group) idObj.set('group', group);
	amplitude.identify(idObj);
	if (group) {
		amplitude.setGroup('team', group);
	}
}

export function clearUser() {
	amplitude.reset();
}

export function logPageView(page) {
	track('Page Viewed', { page });
}

export function track(eventName, eventProps) {
	try {
		const list = JSON.parse(localStorage.getItem('localAmplitudeEvents') || '[]');

		let sessionId = getCurrentSessionId();
		
		let actorEmail;
		try {
			const rawCurrent = localStorage.getItem('currentUser');
			if (rawCurrent) {
				const parsed = JSON.parse(rawCurrent);
				if (parsed && typeof parsed === 'object' && parsed.email) actorEmail = parsed.email;
			}
		} catch { /* ignore */ }

		if (!actorEmail && eventProps?.email) actorEmail = eventProps.email;
		list.push({
			id: list.length + 1,
			event: eventName,
			properties: eventProps || {},
			ts: Date.now(),
			user: actorEmail || undefined,
			sessionId: sessionId || null,
		});
		if (list.length > 1000) list.splice(0, list.length - 1000);
		localStorage.setItem('localAmplitudeEvents', JSON.stringify(list));
	} catch { void 0; }
	return amplitude.track(eventName, eventProps);
}


export default amplitude;
