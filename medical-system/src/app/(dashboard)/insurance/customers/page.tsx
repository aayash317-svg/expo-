import { getProviderCustomers } from "@/app/actions/insurance";
import { Users, Phone, Mail, FileText } from "lucide-react";

export default async function CustomersPage() {
    const { customers, error } = await getProviderCustomers();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                <p className="text-slate-500 text-sm">View patients covered by your insurance policies.</p>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    Error loading customers: {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers && customers.length > 0 ? (
                        customers.map((customer: any) => (
                            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                            {customer.profiles?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{customer.profiles?.full_name}</h3>
                                            <span className="text-xs text-slate-400">ID: {customer.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                        Active
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span>{customer.profiles?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{customer.profiles?.phone || "No phone"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <span>Blood Group: <span className="font-medium text-slate-800">{customer.blood_group || 'N/A'}</span></span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 mt-auto">
                                    <button className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-sm font-medium transition-colors">
                                        View History
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No customers found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
