import mongoose from 'mongoose';

export interface ITipCalculation extends mongoose.Document {
  customerName: string;
  mobileNumber: string;
  billAmount: number;
  tipAmount: number;
  totalAmount: number;
  date: Date;
  tipPercentage: number;
}

const TipCalculationSchema = new mongoose.Schema<ITipCalculation>({
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  billAmount: { type: Number, required: true },
  tipAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  tipPercentage: { type: Number, required: true }
});

export default mongoose.models.TipCalculation || mongoose.model<ITipCalculation>('TipCalculation', TipCalculationSchema); 