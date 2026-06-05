import User from '@/models/User';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';
import { isNotificationEnabled } from './get-notification-preference';

type ProductType = {
  _id: Types.ObjectId;
  name: string;
  stock: number;
  productId: string;
};

type UserType = {
  name: string;
  _id: Types.ObjectId;
};

export async function notifyProductCreated(
  product: ProductType,
  user: UserType
) {
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: 'product_new',
        title: 'New Product Created',
        message: `${user.name} created product: ${product.name}`,
        link: '/products',
      })
    )
  );
}

export async function notifyLowStock(product: ProductType) {
  const admins = await User.find({ role: 'admin' });

  await Promise.all(
    admins.map(async (admin) => {
      const enable = await isNotificationEnabled(
        admin._id,
        'product_low_stock'
      );
      if (!enable) return;
      return await createNotification({
        userId: admin._id,
        type: 'product_low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.stock} remaining)`,
        link: `/products?highlight=${product.productId}`,
      });
    })
  );
}
