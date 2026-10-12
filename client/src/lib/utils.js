// src/lib/utils.js — shared utility helpers
import { clsx } from 'clsx';

/**
 * Merge class names (clsx wrapper — add twMerge later if needed)
 * @param {...*} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format currency in INR
 * @param {number|null} amount
 * @param {string} currency
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount == null) return 'Request a Quote';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to readable string
 * @param {string|Date} date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Truncate text to maxLength with ellipsis
 */
export function truncate(text, maxLength = 120) {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Generate initials from full name
 */
export function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/**
 * Debounce a function
 */
export function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Convert slug to title case */
export function slugToTitle(slug = '') {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
