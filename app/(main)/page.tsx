// /* eslint-disable @next/next/no-img-element */
// 'use client';

// import React, { useContext, useEffect, useState, useRef } from 'react';
// import { LayoutContext } from '../../layout/context/layoutcontext';
// import { getUserCounts } from '@/firebaseUtils';
// import LoadingSpinner from '@/components/LoadingSpinner';
// import { Button } from 'primereact/button';
// import { get, ref, remove } from 'firebase/database';
// import { db } from '@/firebase';
// import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
// import { Dialog } from 'primereact/dialog';
// import { ProgressSpinner } from 'primereact/progressspinner';
// import { Toast } from 'primereact/toast';

// const Dashboard = () => {
//     const { layoutConfig } = useContext(LayoutContext);

//     const [counts, setCounts] = useState<{ total: number; active: number; inactive: number } | null>(null);
//     const [loading, setLoading] = useState(true);

//     const toast = useRef<Toast>(null);

//     const [deleting, setDeleting] = useState(false);

//     useEffect(() => {
//         const fetchCounts = async () => {
//             setLoading(true);
//             try {
//                 const result = await getUserCounts();
//                 setCounts(result);
//             } catch (err) {
//                 console.error('Error fetching user counts:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchCounts();
//     }, []);

//     if (loading || !counts) {
//         return <LoadingSpinner text="Loading dashboard..." fullPage />;
//     }

//     const { total: totalUsers, active: activeUsers, inactive: inactiveUsers } = counts;

//     // const deleteOldOrders = async (type: 'deposits' | 'withdrawals') => {
//     //     const snapshot = await get(ref(db, type));

//     //     if (!snapshot.exists()) return;

//     //     const data = snapshot.val();

//     //     // Beginning of this week (Monday)
//     //     const startOfWeek = new Date();
//     //     const day = startOfWeek.getDay(); // Sunday=0
//     //     const diff = day === 0 ? 6 : day - 1;
//     //     startOfWeek.setDate(startOfWeek.getDate() - diff);
//     //     startOfWeek.setHours(0, 0, 0, 0);

//     //     const deletePromises: Promise<void>[] = [];

//     //     Object.entries(data).forEach(([uid, orders]: [string, any]) => {
//     //         Object.entries(orders).forEach(([orderId, order]: [string, any]) => {
//     //             if ((order.status === 'approved' || order.status === 'rejected') && new Date(order.updatedAt ?? order.createdAt) < startOfWeek) {
//     //                 deletePromises.push(remove(ref(db, `${type}/${uid}/${orderId}`)));
//     //             }
//     //         });
//     //     });

//     //     await Promise.all(deletePromises);

//     //     console.log(`Deleted ${deletePromises.length} old ${type} records`);
//     // };

//     const deleteOldOrders = async () => {
//         setDeleting(true);

//         try {
//             const types: ('deposits' | 'withdrawals')[] = ['deposits', 'withdrawals'];

//             // Beginning of this week (Monday)
//             const startOfWeek = new Date();
//             const day = startOfWeek.getDay();
//             const diff = day === 0 ? 6 : day - 1;

//             startOfWeek.setDate(startOfWeek.getDate() - diff);
//             startOfWeek.setHours(0, 0, 0, 0);

//             let deletedCount = 0;

//             for (const type of types) {
//                 const snapshot = await get(ref(db, type));

//                 if (!snapshot.exists()) continue;

//                 const data = snapshot.val();

//                 const promises: Promise<void>[] = [];

//                 Object.entries(data).forEach(([uid, orders]: [string, any]) => {
//                     Object.entries(orders).forEach(([orderId, order]: [string, any]) => {
//                         const orderDate = new Date(order.updatedAt ?? order.createdAt);

//                         if ((order.status === 'approved' || order.status === 'rejected') && orderDate < startOfWeek) {
//                             deletedCount++;
//                             promises.push(remove(ref(db, `${type}/${uid}/${orderId}`)));
//                         }
//                     });
//                 });

//                 await Promise.all(promises);
//             }

//             toast.current?.show({
//                 severity: 'success',
//                 summary: 'Success',
//                 detail: `${deletedCount} old records deleted successfully.`,
//                 life: 3000
//             });
//         } catch (error) {
//             console.error(error);

//             toast.current?.show({
//                 severity: 'error',
//                 summary: 'Error',
//                 detail: 'Failed to delete old records.',
//                 life: 3000
//             });
//         } finally {
//             setDeleting(false);
//         }
//     };
//     const confirmDelete = () => {
//         confirmDialog({
//             header: 'Delete Old Records',
//             message: 'Are you sure you want to delete all approved and rejected records from previous weeks?',
//             icon: 'pi pi-exclamation-triangle',
//             acceptClassName: 'p-button-danger',
//             accept: deleteOldOrders
//         });
//     };
//     return (
//         <div className="grid">
//             <div className="col-12 lg:col-6 xl:col-3">
//                 <div className="card mb-0">
//                     <div className="flex justify-content-between mb-3">
//                         <div>
//                             <span className="block text-500 font-medium mb-3">Total Users</span>
//                             <div className="text-900 font-medium text-xl">{totalUsers}</div>
//                         </div>
//                         <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
//                             <i className="pi pi-users text-blue-500 text-xl" />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="col-12 lg:col-6 xl:col-3">
//                 <div className="card mb-0">
//                     <div className="flex justify-content-between mb-3">
//                         <div>
//                             <span className="block text-500 font-medium mb-3">Active Users</span>
//                             <div className="text-900 font-medium text-xl">{activeUsers}</div>
//                         </div>
//                         <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
//                             <i className="pi pi-users text-green-500 text-xl" />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="col-12 lg:col-6 xl:col-3">
//                 <div className="card mb-0">
//                     <div className="flex justify-content-between mb-3">
//                         <div>
//                             <span className="block text-500 font-medium mb-3">In Active Users</span>
//                             <div className="text-900 font-medium text-xl">{inactiveUsers}</div>
//                         </div>
//                         <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
//                             <i className="pi pi-users text-red-500 text-xl" />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="col-12 lg:col-6 xl:col-3">
//                 <div className="card mb-0">
//                     <div className="flex justify-content-between mb-3">
//                         <Button type="button" icon="pi pi-trash" label="Delete Old Records" className="hidden sm:flex" outlined onClick={() => deleteOldOrders('deposits')} />
//                     </div>
//                 </div>
//             </div>

//             <Toast ref={toast} />

//             <ConfirmDialog />
//             <Dialog visible={deleting} onHide={() => {}} closable={false} draggable={false} resizable={false} showHeader={false} style={{ width: '250px' }}>
//                 <div className="flex flex-column align-items-center gap-3 py-4">
//                     <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
//                     <span>Deleting old records...</span>
//                 </div>
//             </Dialog>

//             <div className="flex justify-content-between mb-3">
//                 <Button type="button" icon="pi pi-trash" label="Delete Old Records" severity="danger" outlined className="hidden sm:flex" onClick={confirmDelete} />
//             </div>
//         </div>
//     );
// };

// export default Dashboard;

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useEffect, useState, useRef } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { getUserCounts } from '@/firebaseUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from 'primereact/button';
import { get, ref, remove } from 'firebase/database';
import { db } from '@/firebase';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';

const Dashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const [counts, setCounts] = useState<{ total: number; active: number; inactive: number } | null>(null);
    const [loading, setLoading] = useState(true);

    const toast = useRef<Toast>(null);

    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                const result = await getUserCounts();
                setCounts(result);
            } catch (err) {
                console.error('Error fetching user counts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    if (loading || !counts) {
        return <LoadingSpinner text="Loading dashboard..." fullPage />;
    }

    const { total: totalUsers, active: activeUsers, inactive: inactiveUsers } = counts;

    const deleteOldOrders = async () => {
        // setDeleting(true);

        try {
            const types: ('deposits' | 'withdrawals')[] = ['deposits', 'withdrawals'];
            const startOfWeek = new Date();
            const day = startOfWeek.getDay();
            const diff = day === 0 ? 6 : day - 1;

            startOfWeek.setDate(startOfWeek.getDate() - diff);
            startOfWeek.setHours(0, 0, 0, 0);

            let deletedCount = 0;

            for (const type of types) {
                const snapshot = await get(ref(db, type));

                if (!snapshot.exists()) continue;

                const data = snapshot.val();
                const promises: Promise<void>[] = [];

                Object.entries(data).forEach(([uid, orders]: [string, any]) => {
                    Object.entries(orders).forEach(([orderId, order]: [string, any]) => {
                        const orderDate = new Date(order.updatedAt ?? order.createdAt);

                        if (orderDate < startOfWeek) {
                            deletedCount++;
                            promises.push(remove(ref(db, `${type}/${uid}/${orderId}`)));
                        }
                    });
                });

                await Promise.all(promises);
            }
            //   setDeleting(false);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: `${deletedCount} old record${deletedCount === 1 ? '' : 's'} deleted successfully.`,
                life: 3000
            });
        } catch (error) {
            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete old records.',
                life: 3000
            });
        } finally {
            // setDeleting(false);
        }
    };

    const confirmDelete = () => {
        confirmDialog({
            header: 'Delete Old Records',
            message: "Are you sure you want to delete all deposit and withdrawal records from before this week? Only this week's data will be kept.",
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: deleteOldOrders
        });
    };

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Users</span>
                            <div className="text-900 font-medium text-xl">{totalUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Active Users</span>
                            <div className="text-900 font-medium text-xl">{activeUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">In Active Users</span>
                            <div className="text-900 font-medium text-xl">{inactiveUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-red-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <Button type="button" icon="pi pi-trash" label="Delete Old Records" severity="danger" outlined className="w-full" onClick={confirmDelete} />
                    </div>
                </div>
            </div>

            <Toast ref={toast} />

            <ConfirmDialog />

            <Dialog visible={deleting} onHide={() => {}} closable={false} draggable={false} resizable={false} showHeader={false} style={{ width: '250px' }}>
                <div className="flex flex-column align-items-center gap-3 py-4">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                    <span>Deleting old records...</span>
                </div>
            </Dialog>
        </div>
    );
};

export default Dashboard;
