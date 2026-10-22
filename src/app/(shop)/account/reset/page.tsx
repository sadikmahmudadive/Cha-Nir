import type { Metadata } from "next";
import { ResetForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <div className="container-x py-14 sm:py-20">
      <ResetForm />
    </div>
  );
}
