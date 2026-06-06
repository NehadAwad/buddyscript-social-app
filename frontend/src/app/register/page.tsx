import { RegisterForm } from "@/components/organisms/auth/RegisterForm";
import { AuthPageTemplate } from "@/components/templates";

export default function RegisterPage() {
  return (
    <AuthPageTemplate
      variant="register"
      subtitle="Get Started Now"
      title="Registration"
    >
      <RegisterForm />
    </AuthPageTemplate>
  );
}
