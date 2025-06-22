// src/lib/firebase/saveOrder.js
import { db } from "../../firebase";
import { collection,addDoc, Timestamp } from "firebase/firestore";

const formatWhatsAppMessage = (order) => `
NEW ORDER #${order.id}
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email}

ITEMS:
${order.items.map(i =>
    `- ${i.name} (${i.quantity}x) = KES ${(i.price * i.quantity).toLocaleString()}`
).join('\n')}

SUBTOTAL: KES ${(order.total /1.16).toLocaleString()}
VAT (16%): KES ${(order.total * 0.16).toLocaleString()}
TOTAL: KES ${order.total.toLocaleString()}

Notes: ${order.notes || 'None'}
`;


export const saveOrder = async ({ form, cart, total }) => {
    const orderData = {
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        items: cart.map(item => ({
            id: item.id,
            name: item.name || item.title,
            price: item.price,
            quantity: item.quantity,
        })),
        total,
        createdAt: Timestamp.now(),
        status: "Pending",
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    return {
        orderRef: docRef,
        whatsappMessage: formatWhatsAppMessage({
            id: docRef.id,
            ...orderData 
        })
    };
};
