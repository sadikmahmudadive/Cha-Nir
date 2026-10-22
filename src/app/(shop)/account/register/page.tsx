import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <div className="container-x py-14 sm:py-20">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
