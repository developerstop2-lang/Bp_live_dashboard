'use client';

import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

import { ref, get, update, child } from 'firebase/database';
import { db } from '@/firebase'; // your firebase config
import { useRouter } from 'next/navigation';
import { getOrderById, OrderType, updateOrder } from '@/firebaseUtils';

const statusOptions = [
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
];

const UpdateOrder = () => {
    const router = useRouter();

    const [form, setForm] = useState<OrderType | null>(null);
    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState<string>('');

    const orderInfo = localStorage.getItem('orderInfo') ? JSON.parse(localStorage.getItem('orderInfo') as string) : null;

    const uid = orderInfo?.uid;
    const orderId = orderInfo?.orderId;

    console.log('Order Info from Local Storage:', orderInfo);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            const data = await getOrderById(uid, orderId);

            console.log('Fetched Order Data:', data);

            if (data) {
                setForm({ ...data, id: orderId, uid: uid });
                setPreview(data.screenshotAdmin || '');
            }
        };

        fetchOrder();
    }, [orderId]);
    console.log('Form State:', form);

    const handleChange = (field: keyof OrderType, value: any) => {
        if (!form) return;
        setForm({ ...form, [field]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !form) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;

            setForm((prev) => (prev ? { ...prev, screenshotAdmin: base64 } : prev));
            setPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!form) return;

        try {
            setLoading(true);

            await updateOrder(uid, form.id, form);

            alert('Order updated successfully');
            localStorage.removeItem('orderInfo');
            router.push('/pages/withdrawals');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    if (!form) return <p className="text-center">Loading...</p>;

    return (
        <div className="card max-w-3xl mx-auto">
            <div className="col-12">
                <div className="p-3 border-round bg-gray-100">
                    <h3 className="mb-3">Withdrawal Details</h3>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Account Holder:</strong> {form.userName || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Account Number:</strong> {form.accountNumber || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Method:</strong> {form.paymentMethod || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Amount:</strong> PKR {form.amount || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Screenshot */}
            <div className="col-12">
                <label>Upload Screenshot</label>

                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />

                <small className="text-gray-500 block mt-2">Recommended image size: 800 × 800 px or less than 2MB</small>
            </div>

            {/* Preview */}
            {preview && (
                <div className="col-12">
                    <label className="block mb-2">Preview</label>

                    <div
                        className="border-round-xl overflow-hidden border-1 surface-border"
                        style={{
                            width: '220px'
                        }}
                    >
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                width: '100%',
                                height: '220px',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateOrder;
