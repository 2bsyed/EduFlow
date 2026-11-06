"use client";

import { useActionState } from "react";
import { createTeacherAction, type TeacherFormState } from "@/actions/teachers";

const initialState: TeacherFormState = {};

export function TeacherCreateForm() {
  const [state, action, pending] = useActionState(createTeacherAction, initialState);
  return <form action={action} className="grid gap-3 rounded-lg border border-[#dce1e9] bg-white p-5 sm:grid-cols-2">
    <h2 className="sm:col-span-2 text-lg font-semibold">Add teacher</h2>
    <label className="grid gap-1 text-sm font-medium">Full name<input name="name" required minLength={2} autoComplete="name" className="h-10 rounded-md border border-[#c9d1df] px-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-medium">Email<input name="email" required type="email" autoComplete="email" className="h-10 rounded-md border border-[#c9d1df] px-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-medium">Subject<input name="subject" required minLength={2} className="h-10 rounded-md border border-[#c9d1df] px-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-medium">Phone <span className="font-normal text-[#697586]">Optional</span><input name="phone" type="tel" className="h-10 rounded-md border border-[#c9d1df] px-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-medium sm:col-span-2">Temporary password<input name="password" required type="password" minLength={10} autoComplete="new-password" className="h-10 rounded-md border border-[#c9d1df] px-3 font-normal" /><span className="text-xs font-normal text-[#697586]">The system does not email credentials. Share this with the teacher securely.</span></label>
    {state.error && <p role="alert" className="sm:col-span-2 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="sm:col-span-2 text-sm text-green-700">{state.success}</p>}
    <div className="sm:col-span-2"><button disabled={pending} className="h-10 rounded-md bg-[#0f6cbd] px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Creating…" : "Create teacher account"}</button></div>
  </form>;
}
