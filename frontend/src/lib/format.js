export const formatPrice = (price) => {
    if (!price) return null;

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR"
    }).format(price);
}

export const toTitleCase = (str) => {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
