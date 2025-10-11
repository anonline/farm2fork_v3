import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getUsers } from 'src/actions/user-ssr';
import { getAllOrdersSSR } from 'src/actions/order-ssr';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const totalUser = await getUsers();
    const totalUsersCount = totalUser.length;
    const usersByMonthAtLastYear: number[] = Array.from({ length: 12 }, (_, i) => {
        const now = new Date();
        const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const count = totalUser.filter((user) => {
            if (!user.createdAt) return false;
            const createdAt = new Date(user.createdAt);
            return (
                createdAt.getFullYear() === month.getFullYear() &&
                createdAt.getMonth() === month.getMonth()
            );
        }).length;
        return count;
    });

    const newUsersPercentFromLastThirtyDays =
        (totalUser.filter((user) => {
            if (!user.createdAt) return false;
            const createdAt = new Date(user.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt >= thirtyDaysAgo;
        }).length /
            totalUsersCount) *
        100 || 0;


    //---------------------------------------

    const { orders: allOrders } = await getAllOrdersSSR({ page: 1, limit: 1000});
    const processingOrders = allOrders.filter(o=>o.orderStatus == 'processing');

    const totalProcessingOrders = processingOrders.length;
    const processingOrdersSeriesByMonth: number[] = Array.from({ length: 12 }, (_, i) => {
        const now = new Date();
        const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const count = allOrders.filter((order) => {
            if (!order.dateCreated) return false;
            const createdAt = new Date(order.dateCreated);
            return (
                createdAt.getFullYear() === month.getFullYear() &&
                createdAt.getMonth() === month.getMonth()
            );
        }).length;
        return count;
    });

    const processingOrdersByMonthAtLastYear = {
        categories: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        series: processingOrdersSeriesByMonth,
    };

    const filteringDate = new Date();
    filteringDate.setDate(filteringDate.getDate() - 30);

    const processingOrderInTimeRange = processingOrders.filter((order) => {
        if (!order.plannedShippingDateTime) return false;

        const plannedShippingDateTime = new Date(order.plannedShippingDateTime);
        return plannedShippingDateTime >= filteringDate;
    });

    const processingOrdersPercentInTheLast90Days =
        (processingOrderInTimeRange.length / totalProcessingOrders) * 100 || 0;

    //---------------------------------------

    //const locations = await getPickupLocations();
    
    /*const ordersCountByShippingMethod = processingOrderInTimeRange.reduce((acc: Record<string, number>, order) => {
        let method = 'Ismeretlen';
        if (order.shippingMethod?.name == "Házhozszállítás") {
            method = "Házhozszállítás";
        }
        else {
            locations.forEach((loc) => {
                const locAddress = loc.postcode + ' ' + loc.city + ' ' + loc.address;
                if (order.shippingAddress?.fullAddress == locAddress) {
                    method = loc.name;
                }
            });
            acc[method] = (acc[method] || 0) + 1;
        }
        
        return acc;
    }, {});*/

    /*const ordersCountByShippingMethodsArray = Object.keys(ordersCountByShippingMethod).map((key) => ({
        label: key,
        value: ordersCountByShippingMethod[key],
    }));*/

    //---------------------------------------
    
    /*const yearOrders = allOrders.filter((order) => {
        if (!order.dateCreated) return false;
        const createdAt = new Date(order.dateCreated);
        const now = new Date();
        return createdAt.getFullYear() === now.getFullYear();
    });*/

    // Create a map of customer IDs to their roles
    //const customerRoleMap = new Map<string, 'VIP' | 'Magánszemély' | 'Céges'>();
    /*totalUser.forEach((user) => {
            let role: 'VIP' | 'Magánszemély' | 'Céges' = 'Magánszemély';
            if (user.role.is_vip) {
                role = 'VIP';
            } else if (user.role.is_corp) {
                role = 'Céges';
            }
            customerRoleMap.set(user.id, role);

    });*/

    // Group orders by user role and calculate monthly data
    //const userTypes: ('VIP' | 'Magánszemély' | 'Céges')[] = ['Magánszemély', 'VIP', 'Céges'];
    
    /*const ordersInYear = [{
        name: new Date().getFullYear().toString(),
        data: userTypes.map((userType) => {
            const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
                const now = new Date();
                const targetMonth = new Date(now.getFullYear(), monthIndex, 1);
                
                return yearOrders.filter((order) => {
                    if (!order.dateCreated || !order.customerId) return false;
                    
                    const orderDate = new Date(order.dateCreated);
                    const orderRole = customerRoleMap.get(order.customerId) || 'Magánszemély';
                    
                    return (
                        orderRole === userType &&
                        orderDate.getFullYear() === targetMonth.getFullYear() &&
                        orderDate.getMonth() === targetMonth.getMonth()
                    );
                }).length;
            });

            return {
                name: userType,
                sum: monthlyData.reduce((acc, val) => acc + val, 0),
                data: monthlyData,
            };
        }),
    }];*/

    return (
        <OverviewAppView
            totalUsers={totalUsersCount}
            usersByMonthAtLastYear={usersByMonthAtLastYear}
            newUsersPercent={newUsersPercentFromLastThirtyDays}
            totalProcessingOrders={processingOrderInTimeRange.length}
            processingOrdersByMonthAtLastYear={processingOrdersByMonthAtLastYear}
            processingOrdersPercent={processingOrdersPercentInTheLast90Days}
            //ordersCountByShippingMethod={ordersCountByShippingMethodsArray}
            //ordersInYear={ordersInYear}
        />
    );
}
