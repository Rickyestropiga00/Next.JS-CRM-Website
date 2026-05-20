export interface TopSellingProduct {
    code : string;
    name : string;
    totalQuantity : number;
    totalRevenue : number;
    image : string;
    price : number;
    productType : string;
    status: string;
    stock: number;
    completedOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
}