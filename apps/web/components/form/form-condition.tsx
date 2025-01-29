import { CheckCircleIcon } from "lucide-react";
import { FaExclamationTriangle } from "react-icons/fa";

export const FormError = ({ message }: { message: string }) => {
    if (!message) return null;
    return (
        <div className="bg-red-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-500">
            <FaExclamationTriangle/>
            <p>{message}</p>
        </div>
    )
}
export const FormSuccess = ({ message }: { message: string }) => {
    if (!message) return null;
    return (
        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
            <CheckCircleIcon/>
            <p>{message}</p>
        </div>
    )
}