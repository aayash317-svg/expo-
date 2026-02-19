import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function InsuranceVerificationPending() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="bg-blue-100 p-6 rounded-full">
                <ShieldAlert className="h-12 w-12 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Verification Pending</h1>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Your insurance provider account is currently under review.
                    <br />
                    We verify all compliance licenses before enabling claim processing.
                </p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm max-w-md">
                <strong>Note to Reviewers (Expo):</strong>
                <br />
                Please verify this account manually in the database by setting
                `verified = true` in the `insurance_providers` table.
            </div>
            <div className="flex flex-col gap-3 items-center">
                <a href="/auth/signout?redirect=/" className="text-blue-600 hover:underline font-medium">
                    Return to Home
                </a>
                <a href="/auth/signout?redirect=/login/admin" className="text-sm text-red-500 hover:underline">
                    Switch to Admin Login
                </a>
            </div>
        </div>
    )
}
