import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  customer_new: boolean;
  customer_assigned: boolean;
  order_new: boolean;
  order_shipment_update: boolean;
  task_assigned_to_agent: boolean;
  system_product_low_stock: boolean;
  comment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    customer_new: {
      type: Boolean,
      default: true,
    },

    customer_assigned: {
      type: Boolean,
      default: true,
    },

    order_new: {
      type: Boolean,
      default: true,
    },

    order_shipment_update: {
      type: Boolean,
      default: true,
    },
    task_assigned_to_agent: {
      type: Boolean,
      default: true,
    },
    system_product_low_stock: {
      type: Boolean,
      default: true,
    },
     comment: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const NotificationPreference =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>(
    'NotificationPreference',
    notificationPreferenceSchema
  );

export default NotificationPreference;
