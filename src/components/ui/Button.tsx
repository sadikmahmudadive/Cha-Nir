"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { press } from "@/lib/motion";

const MotionLink = motion.create(Link);

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "light" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-tea-600 text-white hover:bg-tea-700 shadow-soft",
  accent: "bg-lime-500 text-tea-950 hover:bg-lime-400 shadow-soft",
  secondary: "border border-tea-600 text-tea-700 hover:bg-tea-100",
  ghost: "text-ink hover:bg-tea-100",
  light: "bg-cream text-tea-800 hover:bg-white shadow-soft",
  danger: "bg-danger text-white hover:bg-[#8f1d17]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-14 px-8 text-base",
};

interface Common {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  full?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

type ButtonProps = Common & Omit<ComponentProps<"button">, keyof Common | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & { href?: undefined };
type LinkProps = Common & { href: string; disabled?: boolean; target?: string; rel?: string; onClick?: () => void; "aria-label"?: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", loading, full, iconLeft, iconRight, children, className } = props;
  const base = cn(
    "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[0.005em] cursor-pointer",
    "transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
  const inner = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, disabled, target, rel, onClick } = props;
    if (disabled) {
      return (
        <span role="link" aria-disabled="true" className={base}>
          {inner}
        </span>
      );
    }
    return (
      <MotionLink
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={props["aria-label"]}
        className={base}
        {...press}
      >
        {inner}
      </MotionLink>
    );
  }

  const {
    variant: _v,
    size: _s,
    loading: _l,
    full: _f,
    iconLeft: _il,
    iconRight: _ir,
    children: _c,
    className: _cn,
    type = "button",
    disabled,
    ...rest
  } = props as ButtonProps;
  void _v; void _s; void _l; void _f; void _il; void _ir; void _c; void _cn;
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={base}
      {...(disabled || loading ? {} : press)}
      {...(rest as object)}
    >
      {inner}
    </motion.button>
  );
}
