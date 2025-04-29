import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

const handleGoogleLogin = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
    errorCallbackURL: "/login",
    newUserCallbackURL: "/dashboard",
  });
};

function RouteComponent() {
  return (
    <div>
      <Button onClick={handleGoogleLogin}>Login with Google</Button>
    </div>
  );
}
