"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminLoginFormProps = {
  nextPath?: string | null;
  labels: {
    username: string;
    password: string;
    submit: string;
    entering: string;
    invalid: string;
    unavailable: string;
    genericError: string;
  };
};

export function AdminLoginForm({ nextPath, labels }: AdminLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setIsSubmitting(false);
      if (response.status === 401) {
        setError(labels.invalid);
        return;
      }
      if (response.status === 503) {
        setError(labels.unavailable);
        return;
      }
      setError(payload?.error || labels.genericError);
      return;
    }

    router.push(nextPath || "/admin");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="field-label" htmlFor="admin-username">
          {labels.username}
        </label>
        <input
          id="admin-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="arcane-field"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="admin-password">
          {labels.password}
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="arcane-field"
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="arcane-button w-full disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? labels.entering : labels.submit}
      </button>

      {error ? <p className="text-sm uppercase tracking-[0.16em] text-rose-200/80">{error}</p> : null}
    </form>
  );
}
