"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone1: string;
  phone2: string;
  phone3: string;
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
  phone1: "",
  phone2: "",
  phone3: "",
  company: "",
  website: "",
  comments: "",
};

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

  function validate(field: string, value: string, current: FormState) {
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
          const combined =
            (field === "phone" ? value : "") ||
            current.phone1 + current.phone2 + current.phone3;
          const errs: string[] = [];
          if (combined.length !== 0 && combined.length !== 10) {
            errs.push("Please enter exactly 10 digits");
          }
          if (combined.length !== 0 && !/^\d+$/.test(combined)) {
            errs.push("Phone number should include digits 0-9 only");
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
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "phone1" || name === "phone2" || name === "phone3") {
        const combined = next.phone1 + next.phone2 + next.phone3;
        validate("phone", combined, next);
      } else {
        validate(name, value, next);
      }
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
        body: JSON.stringify(form),
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

        <div>
          <fieldset className={fieldClass(errors.phone) + " relative"}>
            <legend>Phone:</legend>
            <input
              aria-label="Area code"
              placeholder="XXX"
              type="text"
              name="phone1"
              id="phone1"
              maxLength={3}
              value={form.phone1}
              onChange={handleChange}
              className="w-[calc(25%-4px)] mr-2 text-center"
            />
            <input
              aria-label="First three digits of phone number"
              placeholder="XXX"
              type="text"
              name="phone2"
              id="phone2"
              maxLength={3}
              value={form.phone2}
              onChange={handleChange}
              className="w-[calc(25%-4px)] mr-2 text-center"
            />
            <input
              aria-label="Last four digits of phone number"
              placeholder="XXXX"
              type="text"
              name="phone3"
              id="phone3"
              maxLength={4}
              value={form.phone3}
              onChange={handleChange}
              className="w-[calc(50%-8px)] px-4 text-center"
            />
            {errorOrPlaceholder(errors.phone)}
          </fieldset>
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

      <div>
        <button
          type="submit"
          disabled={submitting}
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
