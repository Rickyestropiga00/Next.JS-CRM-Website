export const formatPrice = (price: number) => {
    return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatStock = (stock: number, type: string) => {
    if (type === "Digital" || type === "Subscription" || type === "Service") {
        return "∞";
    }
    return stock.toString();
};