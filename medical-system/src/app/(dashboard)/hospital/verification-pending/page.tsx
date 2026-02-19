import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth-buttons";

export default function HospitalVerificationPending() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="bg-yellow-100 p-6 rounded-full">
                <ShieldAlert className="h-12 w-12 text-yellow-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Verification Pending</h1>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Your hospital account is currently under review.
                    <br />
                    We verify all medical licenses with the Central Council.
                </p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm max-w-md">
                <strong>Note to Reviewers (Expo):</strong>
                <br />
                Please verify this account manually in the database by setting
                `verified = true` in the `hospitals` table.
            </div>
            <div className="flex flex-col gap-2">
                <Link href="/" className="text-emerald-600 hover:underline">
                    Return to Home
                </Link>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <span>Wrong account?</span>
                    <SignOutButton />
                </div>
            </div>
        </div>
    )
}
