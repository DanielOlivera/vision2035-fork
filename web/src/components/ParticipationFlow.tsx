"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default function ParticipationFlow() {
  const router = useRouter();

  function handleRegistrationSuccess(participantId: string) {
    router.push(`/encuesta?pid=${participantId}`);
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-5 sm:p-8 shadow-sm">
      <RegisterForm onSuccess={handleRegistrationSuccess} />
    </div>
  );
}
