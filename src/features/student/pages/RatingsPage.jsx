import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import Card from '../../../components/Card.jsx';
import Button from '../../../components/Button.jsx';
import { useToast } from '../../../App.jsx';
import { getMenu } from '../../../api/modules/menuApi.js';
import { createRating, getRatings } from '../../../api/modules/feedbackApi.js';

const asList = (value) => (Array.isArray(value) ? value : []);

const ratingMealId = (entry) => entry?.meal_id ?? entry?.meal ?? entry?.mealId ?? null;
const ratingScore = (entry) => Number(entry?.rating ?? entry?.score ?? entry?.value ?? 0);
const ratingAuthor = (entry) =>
  entry?.user_name ?? entry?.username ?? entry?.student_name ?? entry?.author ?? 'Student';
const ratingDate = (entry) => entry?.created_at ?? entry?.createdAt ?? entry?.date ?? null;

const prettyStars = (value) => {
  const score = Math.max(0, Math.min(5, Number(value) || 0));
  return `${'★'.repeat(score)}${'☆'.repeat(5 - score)}`;
};

export default function RatingsPage() {
  const { setToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialMealId = searchParams.get('mealId') ?? '';
  const initialMealName = searchParams.get('mealName') ?? '';

  const [menu, setMenu] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mealId, setMealId] = useState(initialMealId);
  const [score, setScore] = useState(5);

  const selectedMeal = useMemo(
    () => menu.find((item) => String(item.id ?? item.meal_id) === String(mealId)),
    [menu, mealId]
  );

  const averageRating = useMemo(() => {
    const scores = ratings.map((entry) => ratingScore(entry)).filter((n) => Number.isFinite(n) && n > 0);
    if (scores.length === 0) return null;
    const total = scores.reduce((sum, n) => sum + n, 0);
    return total / scores.length;
  }, [ratings]);

  const loadData = async (activeMealId) => {
    setLoading(true);
    try {
      const [menuData, ratingsData] = await Promise.all([
        getMenu().catch(() => []),
        getRatings({ mealId: activeMealId || undefined }),
      ]);
      setMenu(asList(menuData));
      setRatings(asList(ratingsData));
    } catch (err) {
      setToast(err?.message ?? 'Failed to load ratings.', 'error');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(mealId);
  }, [mealId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mealId) {
      setToast('Select a meal before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createRating({ mealId, rating: score });
      setToast('Rating submitted successfully.', 'success');
      await loadData(mealId);
    } catch (err) {
      setToast(err?.message ?? 'Failed to submit rating.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/student/menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-edueats-text"
          >
            <FiArrowLeft className="text-sm" />
          </Link>
          <h1 className="text-xl font-semibold text-edueats-text">Ratings</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm text-edueats-text">Meal</span>
              <select
                value={mealId}
                onChange={(e) => setMealId(e.target.value)}
                className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              >
                <option value="">{initialMealName ? `Choose meal (suggested: ${initialMealName})` : 'Choose meal'}</option>
                {menu.map((item) => (
                  <option key={item.id ?? item.meal_id} value={item.id ?? item.meal_id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-edueats-text">Rating</span>
              <select
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} - {prettyStars(value)}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" fullWidth disabled={submitting}>
              <FiStar className="mr-2" />
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-edueats-text">
              {selectedMeal?.name || initialMealName || 'Selected meal'}
            </p>
            <p className="text-sm text-edueats-textMuted">
              {averageRating ? `${averageRating.toFixed(1)}/5` : 'No ratings'}
            </p>
          </div>
        </Card>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-edueats-textMuted">Recent ratings</h2>
          {loading ? (
            <Card>
              <p className="text-sm text-edueats-textMuted">Loading ratings...</p>
            </Card>
          ) : ratings.length === 0 ? (
            <Card>
              <p className="text-sm text-edueats-textMuted">No ratings found.</p>
            </Card>
          ) : (
            ratings.map((entry, index) => {
              const scoreValue = Math.max(0, Math.min(5, ratingScore(entry)));
              const created = ratingDate(entry);
              return (
                <Card key={entry?.id ?? entry?.rating_id ?? index}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-edueats-text">{ratingAuthor(entry)}</p>
                    <p className="text-sm text-edueats-text">{prettyStars(scoreValue)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-edueats-textMuted">
                    <span>Meal ID: {ratingMealId(entry) ?? '-'}</span>
                    <span>{created ? new Date(created).toLocaleString() : ''}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
