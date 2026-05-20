"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { formatPhoneInput } from "@/lib/phone-format";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);
const TURNSTILE_CALLBACK_NAME = "__ffOnTurnstileSuccess";

declare global {
  interface Window {
    __ffOnTurnstileSuccess?: (token: string) => void;
  }
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  comments: string;
};

type Errors = {
  firstName: string[];
  lastName: string[];
  email: string[];
  phone: string[];
  comments: string[];
};

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  comments: "",
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

const INITIAL_ERRORS: Errors = {
  firstName: ["First name is required"],
  lastName: ["Last name is required"],
  email: ["Email is required"],
  phone: [],
  comments: ["Please give us an idea of what you'd like to discuss!"],
};

function hasErrors(errors: Errors): boolean {
  return Object.values(errors).some((f) => f.length !== 0);
}

export function ContactForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>(INITIAL_ERRORS);
  const [displayErrors, setDisplayErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Cloudflare Turnstile injects this callback by name (data-callback attr).
  // When the challenge clears (often silently), we capture the token and
  // un-gate the submit button.
  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;
    window.__ffOnTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
    return () => {
      delete window.__ffOnTurnstileSuccess;
    };
  }, []);

  const handleTurnstileScriptError = useCallback(() => {
    console.error("[contact] Turnstile script failed to load");
  }, []);

  function validate(field: string, value: string) {
    setErrors((prev) => {
      const next = { ...prev };
      switch (field) {
        case "firstName":
          next.firstName = value.length === 0 ? ["First name is required"] : [];
          break;
        case "lastName":
          next.lastName = value.length === 0 ? ["Last name is required"] : [];
          break;
        case "email": {
          const errs: string[] = [];
          if (value.length === 0) errs.push("Email is required");
          if (!value.includes("@")) errs.push("Email should contain an @");
          next.email = errs;
          break;
        }
        case "phone": {
          // Two acceptance windows, switched by whether the user typed
          // a leading "+":
          //   US (no +):    exactly 10 digits
          //   Intl (+...):  7–15 digits (E.164 range)
          // Empty stays empty (phone is optional on this form).
          const isIntl = value.trimStart().startsWith("+");
          const digits = digitsOnly(value);
          const errs: string[] = [];
          if (digits.length !== 0) {
            if (isIntl) {
              if (digits.length < 7 || digits.length > 15) {
                errs.push("Please enter a valid international phone number");
              }
            } else if (digits.length !== 10) {
              errs.push("Please enter a 10-digit US phone number");
            }
          }
          next.phone = errs;
          break;
        }
        case "comments":
          next.comments =
            value.length === 0
              ? ["Please give us an idea of what you'd like to discuss!"]
              : [];
          break;
      }
      return next;
    });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.currentTarget;
    // Phone is the only field that auto-formats. The formatter strips
    // non-digit characters, so any letters / symbols the user types are
    // dropped before they ever land in state — no separate keystroke
    // filter needed, and paste / autofill go through the same path.
    const nextValue = name === "phone" ? formatPhoneInput(value) : value;
    setForm((prev) => {
      const next = { ...prev, [name]: nextValue };
      validate(name, nextValue);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasErrors(errors)) {
      setDisplayErrors(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      if (!res.ok) throw new Error("Submission failed");
      router.push("/contact-submitted?success=true");
    } catch {
      router.push("/contact-submitted?success=false");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = (err: string[], required = false) =>
    [
      "contact-input",
      required ? "input__required" : "",
      displayErrors && err.length ? "input__error" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const errorOrPlaceholder = (err: string[]) =>
    displayErrors && err.length ? (
      <p className="text-xs text-ff_red">{err[0]}</p>
    ) : (
      <p className="text-xs opacity-0" aria-hidden="true">
        layout placeholder
      </p>
    );

  return (
    <form id="contact-form" className="text-base" onSubmit={handleSubmit}>
      <div className="sm:grid grid-cols-2 gap-x-8">
        <div className={fieldClass(errors.firstName, true)}>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Your first name"
            value={form.firstName}
            onChange={handleChange}
          />
          {errorOrPlaceholder(errors.firstName)}
        </div>

        <div className={fieldClass(errors.lastName, true)}>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Your last name"
            value={form.lastName}
            onChange={handleChange}
          />
          {errorOrPlaceholder(errors.lastName)}
        </div>

        <div className={fieldClass(errors.email, true)}>
          <label htmlFor="email">Your Email:</label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="example@domain.com"
            value={form.email}
            onChange={handleChange}
          />
          {errorOrPlaceholder(errors.email)}
        </div>

        <div className={fieldClass(errors.phone)}>
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="(617) 555-0000"
            autoComplete="tel"
            inputMode="tel"
            value={form.phone}
            onChange={handleChange}
          />
          {errorOrPlaceholder(errors.phone)}
        </div>

        <div className="contact-input">
          <label htmlFor="company">Organization:</label>
          <input
            type="text"
            name="company"
            id="company"
            value={form.company}
            onChange={handleChange}
          />
          <p className="text-xs opacity-0" aria-hidden="true">
            layout placeholder
          </p>
        </div>

        <div className="contact-input">
          <label htmlFor="website">Website:</label>
          <input
            type="text"
            name="website"
            id="website"
            value={form.website}
            onChange={handleChange}
          />
          <p className="text-xs opacity-0" aria-hidden="true">
            layout placeholder
          </p>
        </div>
      </div>

      <div className={fieldClass(errors.comments, true)}>
        <label htmlFor="comments">
          Comments/Tell us about your project (Scope, Timeline, Budget):
        </label>
        <textarea
          name="comments"
          id="comments"
          rows={5}
          value={form.comments}
          onChange={handleChange}
          className="w-full"
        />
        {errorOrPlaceholder(errors.comments)}
      </div>

      {TURNSTILE_ENABLED && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
            onError={handleTurnstileScriptError}
          />
          <div
            className="cf-turnstile mb-4"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-callback={TURNSTILE_CALLBACK_NAME}
          />
        </>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting || (TURNSTILE_ENABLED && !turnstileToken)}
          className="btn linear-gradient-background-hover align-middle mr-8 text-white disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Contact Us"}
        </button>
        {hasErrors(errors) && displayErrors ? (
          <p className="inline-block text-sm text-ff_red bg-ff_red/10 py-5 px-6 mt-4">
            Please correct the highlighted fields above before submitting.
          </p>
        ) : (
          <p className="inline-block text-md py-5 px-6 mt-4 sm:mt-[-40px] sm:float-right">
            <sup>*</sup>Required Fields
          </p>
        )}
      </div>
    </form>
  );
}
