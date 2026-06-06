import { LoginForm } from "@/components/organisms/auth/LoginForm";
import { AuthPageTemplate } from "@/components/templates";

export default function LoginPage() {
  return (
    <AuthPageTemplate
      variant="login"
      subtitle="Welcome back"
      title="Login to your account"
    >
      <LoginForm />
    </AuthPageTemplate>
  );
}
