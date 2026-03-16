import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const getPersonalReport = () => apiRequest(endpoints.reports.studentSummary);

export const getMessReport = async () => {
	const [sales, popular] = await Promise.all([
		apiRequest(endpoints.reports.staffSalesSummary).catch(() => ({})),
		apiRequest(endpoints.reports.staffPopularMeals(10)).catch(() => ([])),
	]);

	const ranking = Array.isArray(popular)
		? popular
		: popular?.results ?? popular?.items ?? [];

	return {
		...sales,
		ranking,
	};
};
