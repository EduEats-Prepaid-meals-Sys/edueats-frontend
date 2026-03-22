import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const getPersonalReport = () => apiRequest(endpoints.reports.studentSummary);
export const getStudentTrend = (days = 7) => apiRequest(endpoints.reports.studentTrend(days));

const buildQuery = (params = {}) => {
	const query = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value == null || value === '') return;
		query.append(key, String(value));
	});
	const qs = query.toString();
	return qs ? `?${qs}` : '';
};

const normalizeList = (payload) =>
	(Array.isArray(payload) ? payload : payload?.results ?? payload?.items ?? []);

export const getDashboardSummary = () => apiRequest(endpoints.utils.dashboardSummary);

export const getStaffSalesSummary = ({ startDate, endDate } = {}) =>
	apiRequest(
		`${endpoints.reports.staffSalesSummary}${buildQuery({ start_date: startDate, end_date: endDate })}`
	);

export const getStaffPopularMeals = ({ startDate, endDate, limit = 10 } = {}) =>
	apiRequest(
		`${endpoints.reports.staffPopularMeals}${buildQuery({
			start_date: startDate,
			end_date: endDate,
			limit,
		})}`
	).then(normalizeList);

export const getMessReport = async () => {
	const [sales, paymentsSummary, popular] = await Promise.all([
		getStaffSalesSummary().catch(() => ({})),
		apiRequest(endpoints.payments.staffSummary).catch(() => ({})),
		getStaffPopularMeals({ limit: 10 }).catch(() => ([])),
	]);

	return {
		...sales,
		...paymentsSummary,
		ranking: popular,
	};
};
