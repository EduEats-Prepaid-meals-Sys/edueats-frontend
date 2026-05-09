import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiStar } from 'react-icons/fi';
import Card from '../../../components/Card.jsx';
import { getMenu } from '../../../api/modules/menuApi.js';
import { getComments, getRatings } from '../../../api/modules/feedbackApi.js';
import { useToast } from '../../../App.jsx';

const asList = (value) => (Array.isArray(value) ? value : []);
const commentMealId = (entry) => String(entry?.meal_id ?? entry?.meal ?? entry?.mealId ?? '');
const ratingMealId = (entry) => String(entry?.meal_id ?? entry?.meal ?? entry?.mealId ?? '');
const commentText = (entry) => entry?.comment ?? entry?.content ?? entry?.text ?? '';
const displayAuthor = (entry) =>
  entry?.user_name ?? entry?.username ?? entry?.student_name ?? entry?.author ?? 'Student';
const displayDate = (entry) => entry?.created_at ?? entry?.createdAt ?? entry?.date ?? null;
const normalizeScore = (value) => Math.max(0, Math.min(5, Number(value) || 0));
const ratingScore = (entry) => normalizeScore(entry?.rating ?? entry?.score ?? entry?.value ?? 0);
const stars = (value) => {
  const rounded = Math.round(normalizeScore(value));
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
};

const FEEDBACK_TABS = {
  comments: 'comments',
  ratings: 'ratings',
};

export default function StaffFeedbackPage() {
  const { setToast } = useToast();
  const [menu, setMenu] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [mealId, setMealId] = useState('');
  const [activeTab, setActiveTab] = useState(FEEDBACK_TABS.comments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [menuData, commentsData, ratingsData] = await Promise.all([
          getMenu().catch(() => []),
          getComments().catch(() => []),
          getRatings().catch(() => []),
        ]);
        setMenu(asList(menuData));
        setComments(asList(commentsData));
        setRatings(asList(ratingsData));
      } catch (err) {
        setToast(err?.message ?? 'Failed to load meal feedback.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setToast]);

  const filteredComments = useMemo(() => {
    if (!mealId) return comments;
    return comments.filter((entry) => commentMealId(entry) === String(mealId));
  }, [comments, mealId]);

  const filteredRatings = useMemo(() => {
    if (!mealId) return ratings;
    return ratings.filter((entry) => ratingMealId(entry) === String(mealId));
  }, [ratings, mealId]);

  const averageRating = useMemo(() => {
    const values = filteredRatings
      .map((entry) => ratingScore(entry))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (values.length === 0) return null;
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
  }, [filteredRatings]);

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/staff/dashboard"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-edueats-text"
          >
            <FiArrowLeft className="text-sm" />
          </Link>
          <h1 className="text-xl font-semibold text-edueats-text">Meal Feedback</h1>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        <Card>
          <label className="block">
            <span className="mb-1 block text-sm text-edueats-text">Filter by meal</span>
            <select
              value={mealId}
              onChange={(e) => setMealId(e.target.value)}
              className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
            >
              <option value="">All meals</option>
              {menu.map((item) => (
                <option key={item.id ?? item.meal_id} value={item.id ?? item.meal_id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </Card>

        <div className="flex gap-2 rounded-full bg-edueats-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab(FEEDBACK_TABS.comments)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium ${
              activeTab === FEEDBACK_TABS.comments
                ? 'bg-edueats-accent text-white'
                : 'text-edueats-textMuted'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FiMessageSquare />
              Comments
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(FEEDBACK_TABS.ratings)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium ${
              activeTab === FEEDBACK_TABS.ratings
                ? 'bg-edueats-accent text-white'
                : 'text-edueats-textMuted'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FiStar />
              Ratings
            </span>
          </button>
        </div>

        {activeTab === FEEDBACK_TABS.comments ? (
          <div className="space-y-2">
            {loading ? (
              <Card>
                <p className="text-sm text-edueats-textMuted">Loading comments...</p>
              </Card>
            ) : filteredComments.length === 0 ? (
              <Card>
                <p className="text-sm text-edueats-textMuted">No comments found.</p>
              </Card>
            ) : (
              filteredComments.map((entry, index) => {
                const created = displayDate(entry);
                return (
                  <Card key={entry?.id ?? entry?.comment_id ?? index}>
                    <p className="text-sm font-medium text-edueats-text">{displayAuthor(entry)}</p>
                    <p className="mt-1 text-sm text-edueats-text">{commentText(entry)}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-edueats-textMuted">
                      <span>Meal ID: {commentMealId(entry) || '-'}</span>
                      <span>{created ? new Date(created).toLocaleString() : ''}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-edueats-text">Average Rating</p>
                <p className="text-sm text-edueats-textMuted">
                  {averageRating ? `${averageRating.toFixed(1)}/5` : 'No ratings'}
                </p>
              </div>
            </Card>
            {loading ? (
              <Card>
                <p className="text-sm text-edueats-textMuted">Loading ratings...</p>
              </Card>
            ) : filteredRatings.length === 0 ? (
              <Card>
                <p className="text-sm text-edueats-textMuted">No ratings found.</p>
              </Card>
            ) : (
              filteredRatings.map((entry, index) => {
                const created = displayDate(entry);
                const score = ratingScore(entry);
                return (
                  <Card key={entry?.id ?? entry?.rating_id ?? index}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-edueats-text">{displayAuthor(entry)}</p>
                      <p className="text-sm text-edueats-text">{stars(score)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-edueats-textMuted">
                      <span>Meal ID: {ratingMealId(entry) || '-'}</span>
                      <span>{created ? new Date(created).toLocaleString() : ''}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
