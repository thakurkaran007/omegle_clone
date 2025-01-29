"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/src/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@repo/ui/src/components/input";
import { useState } from "react";
import signup from "@/actions/signup";
import { SignUpSchema } from "@/schema";
import { Button } from "@repo/ui/src/components/button";
import { CardWrapper } from "./CardWrapper";
import { FormError, FormSuccess } from "./form-condition";
import { send } from "@/actions/send-otp";
import { verifyOtp } from "@/actions/verify-otp";
import { useRouter } from "next/navigation";

export const SignupForm = () => {
  const router = useRouter();
  const [came, setCame] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      otp: "",
      name: "",
      email: "",
      password1: "",
      password2: "",
    },
  });

  const handleOtp = async () => {
    setIsSending(true);
    try {
      const mail = form.getValues("email");
      if (mail === "") {
        setError("Email is required");
        return;
      }
      const res = await send(mail);
      if (res.error) {
        setSuccess("");
        setError(res.error.toString());
        form.reset();
        return;
      }
      if (res.success) {
        setSuccess(res.success);
        setCame(true);
        setError("");
      }
    } catch (e) {
      setSuccess("");
      setError(e as string);
    } finally {
      setIsSending(false);
    }
  };

  const verify = async () => {
    setIsVerifying(true);
    try {
      const email = form.getValues("email");
      const otpValue = form.getValues("otp");
      const res = await verifyOtp(otpValue, email);
      if (res.success) {
        setVerified(true);
        setSuccess("");
        setError("");
      } else {
        setError(res.error || "OTP verification failed");
      }
    } catch (e) {
      setError(e as string);
      setSuccess("");
    } finally {
      setIsVerifying(false);
    }
  };

  const submit = async (values: z.infer<typeof SignUpSchema>) => {
    setIsSigningUp(true);
    try {
      const response = await signup(values);
      if (response.error) {
        setError(response.error);
        setSuccess("");
      }
      if (response.success) {
        setSuccess(response.success);
        setError("");
        router.push("/auth/login");
      }
    } catch {
      setError("An error occurred");
      setSuccess("");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Back to login?"
      backButtonhref="/auth/login"
      showSocial={true}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="abc@gmail.com" disabled={came || verified || isSending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OTP Field */}
            {came && !verified && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="******" disabled={isVerifying} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Name and Password Fields */}
            {verified && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name" type="text" disabled={isSigningUp} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="********" type="password" disabled={isSigningUp} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="********" type="password" disabled={isSigningUp} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div>
            {!came && !verified && (
              <Button type="button" onClick={handleOtp} disabled={isSending}>
                {isSending ? "Sending..." : "Send OTP"}
              </Button>
            )}
            {came && !verified && (
              <Button type="button" onClick={verify} disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            )}
            {verified && (
              <Button type="submit" disabled={isSigningUp}>
                {isSigningUp ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && !success && <FormError message={error} />}
          {success && !error && <FormSuccess message={success} />}
        </form>
      </Form>
    </CardWrapper>
  );
};