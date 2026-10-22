import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <div className="container-x py-14 sm:py-20">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
