import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Enterprise Knowledge Copilot
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
