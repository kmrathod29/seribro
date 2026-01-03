// Utility to safely extract a user-friendly message for toasts
export function getMessage(input, fallback = 'Something went wrong') {
  try {
    if (input === undefined || input === null) return fallback;
    if (typeof input === 'string' || typeof input === 'number') return input;
    if (input instanceof Error) return input.message || fallback;

    // Axios-like error shapes
    if (input.response?.data) {
      const data = input.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
    }

    if (input.data) {
      const d = input.data;
      if (typeof d === 'string') return d;
      if (d && d.message) return d.message;
    }

    if (input.message && typeof input.message === 'string') return input.message;
    if (input.message) return JSON.stringify(input.message);

    // Fallback to JSON string of the input (safe short-circuit)
    return typeof input === 'object' ? JSON.stringify(input) : String(input);
  } catch (e) {
    return fallback;
  }
}
