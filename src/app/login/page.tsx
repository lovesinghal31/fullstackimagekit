"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Github, Loader2, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/schemas/loginSchema";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (result?.error) {
      const toastId = toast.error(result.error, {
        style: {
          height: "50px",
        },
        action: {
          label: <Trash2 className="w-4 h-4" />,
          onClick: () => toast.dismiss(toastId),
        },
      });
      setIsSubmitting(false);
    }

    if (result?.url) {
      router.replace("/profile");
      const toastId = toast.success("Successfully signed in", {
        style: {
          height: "50px",
        },
        action: {
          label: <Trash2 className="w-4 h-4" />,
          onClick: () => toast.dismiss(toastId),
        },
      });
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border-2">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Login
          </h1>
          <p className="mb-4">Login to your account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="cursor-pointer w-full flex items-center justify-center gap-2 border mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/profile" })}
              className="w-full cursor-pointer flex items-center justify-center gap-2 border mt-4"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Did not have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800"
            >
              Register here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
