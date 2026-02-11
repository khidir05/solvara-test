const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function fetchTickets() {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    // Always show fresh data on dashboard
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.status}`);
  }

  return res.json();
}

export async function fetchTicket(id) {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ticket ${id}: ${res.status}`);
  }

  return res.json();
}

export async function createTicket(content) {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create ticket");
  }

  return res.json();
}

export async function updateTicket(id, payload) {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update ticket");
  }

  return res.json();
}

